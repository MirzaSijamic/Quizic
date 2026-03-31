# services/course_service.py
from crud.course_crud import course_crud

def fetch_courses(conn):
    return course_crud.get_all(conn)

def fetch_course_by_id(conn, course_id: int):
    return course_crud.get_by_id(conn, course_id)

def create_course(conn, course_data: dict):
    # course_data needs to be a dictionary, which we will get from Pydantic schemas!
    return course_crud.create(conn, course_data)

def update_course(conn, course_id: int, course_data: dict):
    return course_crud.update(conn, course_id, course_data)

def delete_course(conn, course_id: int):
    return course_crud.delete(conn, course_id)