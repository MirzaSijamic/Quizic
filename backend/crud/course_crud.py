# crud/course_crud.py
from .base_crud import BaseCRUD

# Create an instance for the 'courses' table
course_crud = BaseCRUD("courses")

# If you ever need a complex, custom query just for courses, you can still add it here!
def get_courses_by_difficulty(conn, difficulty: str):
    cur = conn.cursor()
    cur.execute("SELECT * FROM courses WHERE difficulty = %s;", (difficulty,))
    results = cur.fetchall()
    cur.close()
    return results