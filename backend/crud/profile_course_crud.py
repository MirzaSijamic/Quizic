from .base_crud import BaseCRUD

class ProfileCourseCRUD(BaseCRUD):
    def __init__(self):
        super().__init__("profile_course")

    def get_profile_courses_by_profile_id(self, conn, profile_id: int):
        cur = conn.cursor()
        cur.execute("SELECT * FROM profile_course WHERE profile_id = %s;", (profile_id,))
        results = cur.fetchall()
        cur.close()
        return results
    
    def get_course_id_by_quiz_id(self, conn, quiz_id: int):
        cur = conn.cursor()
        cur.execute("""
                    SELECT course_id
                    FROM quizzes q
                    JOIN lessons l ON q.lesson_id = l.id
                    WHERE q.id = %s;
                    """, (quiz_id,))
        result = cur.fetchone()
        cur.close()
        return result["course_id"] if result else None
    
    def get_quiz_ids_by_course_id(self, conn, course_id: int):
        cur = conn.cursor()
        cur.execute("""
                    SELECT q.id
                    FROM quizzes q
                    JOIN lessons l ON q.lesson_id = l.id
                    WHERE l.course_id = %s;
                    """, (course_id,))
        results = cur.fetchall()
        cur.close()
        return [row["id"] for row in results]
    
    def get_passed_quiz_ids_for_profile_in_course(self, conn, profile_id: int, course_id: int):
        cur = conn.cursor()
        cur.execute("""
                    SELECT DISTINCT r.quiz_id
                    FROM results r
                    JOIN quizzes q ON r.quiz_id = q.id
                    JOIN lessons l ON q.lesson_id = l.id
                    WHERE r.profile_id = %s AND l.course_id = %s AND r.passed = TRUE;
                    """, (profile_id, course_id))
        results = cur.fetchall()
        cur.close()
        return [row["quiz_id"] for row in results]
    
    def upsert_profile_course_completion(self, conn, profile_id: int, course_id: int, completed: bool):
        cur = conn.cursor()
        cur.execute("""
                    INSERT INTO profile_course (profile_id, course_id, completed)
                    VALUES (%s, %s, %s)
                    ON CONFLICT (profile_id, course_id) DO UPDATE SET completed = EXCLUDED.completed;
                    """, (profile_id, course_id, completed))
        conn.commit()
        cur.close()


    def get_course_completion_status(self, conn, profile_id: int):
        curr = conn.cursor()
        curr.execute("""
                    WITH total AS (
                    SELECT l.course_id, COUNT(DISTINCT q.id) AS total_quizzes
                    FROM lessons l
                    JOIN quizzes q ON q.lesson_id = l.id
                    GROUP BY l.course_id
                  ),
                  passed AS (
                    SELECT l.course_id, COUNT(DISTINCT r.quiz_id) AS passed_quizzes
                    FROM results r
                    JOIN quizzes q ON q.id = r.quiz_id
                    JOIN lessons l ON l.id = q.lesson_id
                    WHERE r.profile_id = %s
                      AND r.passed = TRUE
                    GROUP BY l.course_id
                  )
                  SELECT
                    c.id AS course_id,
                    c.name AS course_name,
                    COALESCE(t.total_quizzes, 0) AS total_quizzes,
                    COALESCE(p.passed_quizzes, 0) AS passed_quizzes,
                    (
                      COALESCE(t.total_quizzes, 0) > 0
                      AND COALESCE(p.passed_quizzes, 0) = COALESCE(t.total_quizzes, 0)
                    ) AS completed
                  FROM courses c
                  LEFT JOIN total t ON t.course_id = c.id
                  LEFT JOIN passed p ON p.course_id = c.id
                  ORDER BY c.id;
                     """, (profile_id,))
        results = curr.fetchall()
        curr.close()
        return results

profile_course_crud = ProfileCourseCRUD()


"""
{
  "quiz_id": 4 ,
  "answers": [
    {
      "question_id": 13,
      "selected_answer": "1"
    }
  ]
}
"""

"""
SELECT
  total.total_quizzes,
  passed.passed_quizzes,
  (total.total_quizzes > 0 AND passed.passed_quizzes = total.total_quizzes) AS completed
FROM
  (
    SELECT COUNT(DISTINCT q.id) AS total_quizzes
    FROM quizzes q
    JOIN lessons l ON l.id = q.lesson_id
    WHERE l.course_id = %s
  ) total,
  (
    SELECT COUNT(DISTINCT r.quiz_id) AS passed_quizzes
    FROM results r
    JOIN quizzes q ON q.id = r.quiz_id
    JOIN lessons l ON l.id = q.lesson_id
    WHERE r.profile_id = %s
      AND r.passed = TRUE
      AND l.course_id = %s
  ) passed;
"""

"""
WITH total AS (
  SELECT l.course_id, COUNT(DISTINCT q.id) AS total_quizzes
  FROM lessons l
  JOIN quizzes q ON q.lesson_id = l.id
  GROUP BY l.course_id
),
passed AS (
  SELECT l.course_id, COUNT(DISTINCT r.quiz_id) AS passed_quizzes
  FROM results r
  JOIN quizzes q ON q.id = r.quiz_id
  JOIN lessons l ON l.id = q.lesson_id
  WHERE r.profile_id = %s
    AND r.passed = TRUE
  GROUP BY l.course_id
)
SELECT
  c.id AS course_id,
  COALESCE(t.total_quizzes, 0) AS total_quizzes,
  COALESCE(p.passed_quizzes, 0) AS passed_quizzes,
  (
    COALESCE(t.total_quizzes, 0) > 0
    AND COALESCE(p.passed_quizzes, 0) = COALESCE(t.total_quizzes, 0)
  ) AS completed
FROM courses c
LEFT JOIN total t ON t.course_id = c.id
LEFT JOIN passed p ON p.course_id = c.id
ORDER BY c.id;
"""
