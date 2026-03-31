from .base_crud import BaseCRUD

question_crud = BaseCRUD("questions")


def get_by_quiz_id(conn, quiz_id: int):
        cur = conn.cursor()
        cur.execute("SELECT * FROM questions WHERE quiz_id = %s ORDER BY id;", (quiz_id,))
        results = cur.fetchall()
        cur.close()
        return results