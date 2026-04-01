import base64
import hashlib
import hmac
import json
import os


def _session_secret() -> bytes:
    secret = os.getenv("SESSION_SECRET_KEY", "dev-only-change-me").encode("utf-8")
    return secret


def encode_session_user(value: dict) -> str:
    payload_bytes = json.dumps(value, separators=(",", ":"), ensure_ascii=True).encode("utf-8")
    payload = base64.urlsafe_b64encode(payload_bytes).decode("utf-8")
    signature = hmac.new(_session_secret(), payload.encode("utf-8"), hashlib.sha256).hexdigest()
    return f"{payload}.{signature}"


def decode_session_user(token: str | None) -> dict | None:
    if not token:
        return None

    try:
        payload, signature = token.rsplit(".", 1)
    except ValueError:
        return None

    expected_signature = hmac.new(_session_secret(), payload.encode("utf-8"), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(signature, expected_signature):
        return None

    try:
        decoded_bytes = base64.urlsafe_b64decode(payload.encode("utf-8"))
        return json.loads(decoded_bytes.decode("utf-8"))
    except (ValueError, json.JSONDecodeError):
        return None