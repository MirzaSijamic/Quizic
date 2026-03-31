# services/profile_service.py
from crud import profile_crud

def fetch_profiles(conn):
    return profile_crud.get_all_profiles(conn)

def fetch_profile_by_id(conn, profile_id: int):
    return profile_crud.get_profile_by_id(conn, profile_id)

def create_profile(conn, profile_data: dict):
    return profile_crud.create_profile(conn, profile_data)

def update_profile(conn, profile_id: int, profile_data: dict):
    return profile_crud.update_profile(conn, profile_id, profile_data)

def delete_profile(conn, profile_id: int):
    return profile_crud.delete_profile(conn, profile_id)