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


profile_course_crud = ProfileCourseCRUD()


