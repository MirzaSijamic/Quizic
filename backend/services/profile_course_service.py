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

def upsert_profile_course_completion(conn, profile_id: int, course_id: int, completed: bool):
    return profile_course_crud.upsert_profile_course_completion(conn, profile_id, course_id, completed)


def sync_profile_course_completion(conn, profile_id: int, course_id: int):
    quiz_ids = profile_course_crud.get_quiz_ids_by_course_id(conn, course_id)
    passed_quiz_ids = profile_course_crud.get_passed_quiz_ids_for_profile_in_course(conn, profile_id, course_id)
    completed = len(quiz_ids) > 0 and set(quiz_ids).issubset(set(passed_quiz_ids))
    return profile_course_crud.upsert_profile_course_completion(conn, profile_id, course_id, completed)

def get_course_completion_status(conn, profile_id: int):
    return profile_course_crud.get_course_completion_status(conn, profile_id)
