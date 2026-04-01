# crud/profile_crud.py
from .base_crud import BaseCRUD

profile_crud = BaseCRUD("profiles")

def get_all_profiles(conn):
    return profile_crud.get_all(conn)

def get_profile_by_id(conn, profile_id: int):
    return profile_crud.get_by_id(conn, profile_id)


def get_profile_by_email(conn, email: str):
    cur = conn.cursor()
    cur.execute("SELECT * FROM profiles WHERE email = %s LIMIT 1;", (email,))
    result = cur.fetchone()
    cur.close()
    return result

def create_profile(conn, profile_data: dict):
    return profile_crud.create(conn, profile_data)

def update_profile(conn, profile_id: int, profile_data: dict):
    return profile_crud.update(conn, profile_id, profile_data)

def delete_profile(conn, profile_id: int):
    return profile_crud.delete(conn, profile_id)