from fastapi import Cookie, Depends, HTTPException, status

from auth_session import decode_session_user
from database import get_db_connection
from services import profile_service


def get_current_user(
    session_user: str | None = Cookie(default=None),
    conn=Depends(get_db_connection),
) -> dict:
    session_data = decode_session_user(session_user)
    if not session_data:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")

    email = session_data.get("email")
    if not isinstance(email, str) or not email.strip():
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid session")

    profile = profile_service.fetch_profile_by_email(conn, email.strip())
    if not profile:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Profile not found")

    return {
        "profile_id": profile["id"],
        "email": profile["email"],
        "role": profile.get("role", "student"),
        "display_name": profile.get("full_name") or session_data.get("display_name", ""),
    }


def require_admin(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user