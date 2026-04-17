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

def get_courses_by_team(conn, team_id: int):
    cur = conn.cursor()
    cur.execute("SELECT * FROM courses WHERE team_id = %s ORDER BY id;", (team_id,))
    rows = cur.fetchall()
    cur.close()
    return rows

def get_course_by_id_and_team(conn, course_id: int, team_id:int):
    cur = conn.cursor()
    cur.execute("SELECT * FROM courses WHERE id = %s AND team_id = %s LIMIT 1", (course_id, team_id))
    row = cur.fetchone()
    cur.close()
    return row