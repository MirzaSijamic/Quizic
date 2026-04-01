# services/profile_service.py
from crud import profile_crud

def fetch_profiles(conn):
    return profile_crud.get_all_profiles(conn)

def fetch_profile_by_id(conn, profile_id: int):
    return profile_crud.get_profile_by_id(conn, profile_id)


def fetch_profile_by_email(conn, email: str):
    return profile_crud.get_profile_by_email(conn, email)

def create_profile(conn, profile_data: dict):
    return profile_crud.create_profile(conn, profile_data)


def ensure_oauth_profile(conn, email: str, display_name: str | None = None):
    existing_profile = fetch_profile_by_email(conn, email)
    if existing_profile:
        return existing_profile

    full_name = (display_name or "").strip() or email.split("@")[0]
    return create_profile(
        conn,
        {
            "full_name": full_name,
            "email": email,
            "role": "student",
        },
    )

def update_profile(conn, profile_id: int, profile_data: dict):
    return profile_crud.update_profile(conn, profile_id, profile_data)

def delete_profile(conn, profile_id: int):
    return profile_crud.delete_profile(conn, profile_id)