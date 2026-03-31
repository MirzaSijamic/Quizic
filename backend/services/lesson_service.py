from crud.lesson_crud import lesson_crud


def fetch_lessons(conn):
    return lesson_crud.get_all(conn)


def fetch_lesson_by_id(conn, lesson_id: int):
    return lesson_crud.get_by_id(conn, lesson_id)


def create_lesson(conn, lesson_data: dict):
    return lesson_crud.create(conn, lesson_data)


def update_lesson(conn, lesson_id: int, lesson_data: dict):
    return lesson_crud.update(conn, lesson_id, lesson_data)


def delete_lesson(conn, lesson_id: int):
    return lesson_crud.delete(conn, lesson_id)
