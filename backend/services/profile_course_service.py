from crud.profile_course_crud import profile_course_crud


def fetch_profile_courses(conn):
    return profile_course_crud.get_all(conn)


def fetch_profile_course_by_id(conn, profile_course_id: int):
    return profile_course_crud.get_by_id(conn, profile_course_id)

def fetch_profile_courses_by_profile_id(conn, profile_id):
    return profile_course_crud.get_profile_courses_by_profile_id(conn, profile_id)


def create_profile_course(conn, profile_course_data: dict):
    return profile_course_crud.create(conn, profile_course_data)


def update_profile_course(conn, profile_course_id: int, profile_course_data: dict):
    return profile_course_crud.update(conn, profile_course_id, profile_course_data)


def delete_profile_course(conn, profile_course_id: int):
    return profile_course_crud.delete(conn, profile_course_id)
