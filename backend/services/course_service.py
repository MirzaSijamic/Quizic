# services/course_service.py
from crud.course_crud import course_crud, get_course_by_id_and_team, get_courses_by_team

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

def fetch_courses_by_team(conn, team_id: int):
    return get_courses_by_team(conn, team_id)

def fetch_course_by_id_and_team(conn, course_id: int, team_id: int):
    return get_course_by_id_and_team(conn, course_id, team_id)

