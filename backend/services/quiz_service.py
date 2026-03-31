from crud.quiz_crud import quiz_crud


def fetch_quizzes(conn):
    return quiz_crud.get_all(conn)


def fetch_quiz_by_id(conn, quiz_id: int):
    return quiz_crud.get_by_id(conn, quiz_id)


def create_quiz(conn, quiz_data: dict):
    return quiz_crud.create(conn, quiz_data)


def update_quiz(conn, quiz_id: int, quiz_data: dict):
    return quiz_crud.update(conn, quiz_id, quiz_data)


def delete_quiz(conn, quiz_id: int):
    return quiz_crud.delete(conn, quiz_id)

def fetch_quizzes_by_course_id(conn, course_id: int):
    return quiz_crud.get_by_course_id(conn, course_id)

