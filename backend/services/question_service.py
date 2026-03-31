from crud.question_crud import question_crud, get_by_quiz_id
from psycopg2.extras import Json


def fetch_questions(conn):
    return question_crud.get_all(conn)


def fetch_question_by_id(conn, question_id: int):
    return question_crud.get_by_id(conn, question_id)


def create_question(conn, question_data: dict):
    if "answers" in question_data:
        question_data = {**question_data, "answers": Json(question_data["answers"])}
    return question_crud.create(conn, question_data)


def update_question(conn, question_id: int, question_data: dict):
    if "answers" in question_data:
        question_data = {**question_data, "answers": Json(question_data["answers"])}
    return question_crud.update(conn, question_id, question_data)


def delete_question(conn, question_id: int):
    return question_crud.delete(conn, question_id)

def fetch_questions_by_quiz_id(conn, quiz_id: int):
    return get_by_quiz_id(conn, quiz_id)
