import base64
import json
import os
import secrets
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

from fastapi import APIRouter, Cookie, HTTPException, Query
from fastapi.responses import JSONResponse, RedirectResponse

router = APIRouter(prefix="/api/auth", tags=["Auth"])


def _encode_session(value: dict) -> str:
    raw = json.dumps(value).encode("utf-8")
    return base64.urlsafe_b64encode(raw).decode("utf-8")


def _decode_session(value: str | None) -> dict | None:
    if not value:
        return None
    try:
        decoded = base64.urlsafe_b64decode(value.encode("utf-8")).decode("utf-8")
        return json.loads(decoded)
    except (ValueError, json.JSONDecodeError):
        return None


def _required_env(name: str) -> str:
    value = os.getenv(name, "").strip()
    if not value:
        raise HTTPException(status_code=500, detail=f"Missing environment variable: {name}")
    return value


def _oauth_settings() -> dict:
    frontend_base = os.getenv("FRONTEND_BASE_URL", "http://localhost:5173").rstrip("/")
    backend_base = os.getenv("BACKEND_BASE_URL", "http://127.0.0.1:8000").rstrip("/")
    tenant_id = _required_env("AZURE_TENANT_ID")
    client_id = _required_env("AZURE_CLIENT_ID")
    client_secret = _required_env("AZURE_CLIENT_SECRET")

    redirect_uri = os.getenv("AZURE_REDIRECT_URI", f"{backend_base}/api/auth/microsoft/callback").strip()
    authorize_url = f"https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/authorize"
    token_url = f"https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token"

    return {
        "frontend_base": frontend_base,
        "redirect_uri": redirect_uri,
        "authorize_url": authorize_url,
        "token_url": token_url,
        "client_id": client_id,
        "client_secret": client_secret,
    }


def _post_form(url: str, data: dict) -> dict:
    encoded = urlencode(data).encode("utf-8")
    request = Request(
        url,
        data=encoded,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        method="POST",
    )
    try:
        with urlopen(request) as response:
            return json.loads(response.read().decode("utf-8"))
    except HTTPError as exc:
        try:
            error_body = exc.read().decode("utf-8")
        except Exception:
            error_body = ""
        detail = f"Token exchange failed: {exc}"
        if error_body:
            detail = f"{detail}. Provider response: {error_body}"
        raise HTTPException(status_code=400, detail=detail)
    except URLError as exc:
        raise HTTPException(status_code=400, detail=f"Token exchange failed: {exc}")


def _get_json(url: str, access_token: str) -> dict:
    request = Request(
        url,
        headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
        },
        method="GET",
    )
    try:
        with urlopen(request) as response:
            return json.loads(response.read().decode("utf-8"))
    except (HTTPError, URLError):
        raise HTTPException(status_code=400, detail="Failed to fetch user profile")


@router.get("/microsoft/login")
def microsoft_login(frontend_redirect: str | None = Query(default=None)):
    settings = _oauth_settings()
    redirect_target = frontend_redirect or f"{settings['frontend_base']}/oauth/callback"

    state = secrets.token_urlsafe(32)
    query = urlencode(
        {
            "client_id": settings["client_id"],
            "response_type": "code",
            "redirect_uri": settings["redirect_uri"],
            "response_mode": "query",
            "scope": "openid profile email User.Read",
            "state": state,
            "prompt": "select_account",
        }
    )

    response = RedirectResponse(url=f"{settings['authorize_url']}?{query}")
    response.set_cookie("oauth_state", state, httponly=True, secure=False, samesite="lax", max_age=600)
    response.set_cookie("oauth_next", redirect_target, httponly=True, secure=False, samesite="lax", max_age=600)
    return response


@router.get("/microsoft/callback")
def microsoft_callback(
    code: str | None = Query(default=None),
    state: str | None = Query(default=None),
    error: str | None = Query(default=None),
    oauth_state: str | None = Cookie(default=None),
    oauth_next: str | None = Cookie(default=None),
):
    settings = _oauth_settings()
    fallback_frontend = f"{settings['frontend_base']}/oauth/callback"
    frontend_target = oauth_next or fallback_frontend

    if error:
        return RedirectResponse(url=f"{frontend_target}?status=error&reason={error}")

    if not code or not state or not oauth_state or state != oauth_state:
        return RedirectResponse(url=f"{frontend_target}?status=error&reason=state_mismatch")

    token_payload = _post_form(
        settings["token_url"],
        {
            "grant_type": "authorization_code",
            "client_id": settings["client_id"],
            "client_secret": settings["client_secret"],
            "code": code,
            "redirect_uri": settings["redirect_uri"],
            "scope": "openid profile email User.Read",
        },
    )

    access_token = token_payload.get("access_token")
    if not access_token:
        return RedirectResponse(url=f"{frontend_target}?status=error&reason=token_missing")

    profile = _get_json("https://graph.microsoft.com/v1.0/me", access_token)
    user = {
        "id": profile.get("id", ""),
        "email": profile.get("mail") or profile.get("userPrincipalName") or "",
        "display_name": profile.get("displayName") or "",
    }

    response = RedirectResponse(url=f"{frontend_target}?status=success")
    response.set_cookie(
        "session_user",
        _encode_session(user),
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=60 * 60 * 8,
    )
    response.delete_cookie("oauth_state")
    response.delete_cookie("oauth_next")
    return response


@router.get("/me")
def me(session_user: str | None = Cookie(default=None)):
    user = _decode_session(session_user)
    if not user:
        return JSONResponse({"authenticated": False}, status_code=401)
    return {"authenticated": True, "user": user}


@router.post("/logout")
def logout():
    response = JSONResponse({"ok": True})
    response.delete_cookie("session_user")
    response.delete_cookie("oauth_state")
    response.delete_cookie("oauth_next")
    return response