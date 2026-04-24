# routers/courses.py
from fastapi import APIRouter, Depends, HTTPException, status
from database import get_db_connection
from schemas import CourseCreate, CourseRead, CourseUpdate
from services import course_service
from dependencies.auth import get_current_user, require_admin

router = APIRouter(prefix="/api/courses", tags=["Courses"])

@router.get("/")
def get_courses(conn = Depends(get_db_connection),
                current_user: dict = Depends(get_current_user)
                ) -> list[CourseRead]:
    team_id = current_user["team_id"]
    return course_service.fetch_courses_by_team(conn, team_id)

@router.get("/{course_id}")
def get_course_by_id(course_id: int,
                    conn = Depends(get_db_connection),
                    current_user: dict = Depends(get_current_user)
                    ) -> CourseRead:
    team_id = current_user["team_id"]
    course = course_service.fetch_course_by_id_and_team(conn, course_id, team_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_course(course_data: CourseCreate, conn = Depends(get_db_connection), current_user: dict = Depends(require_admin)) -> CourseRead:
    team_id = current_user.get("team_id")
    if team_id is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Admin account is not associated with a team")
    data = course_data.model_dump()
    data["team_id"] = team_id
    return course_service.create_course(conn, data)

@router.put("/{course_id}")
def update_course(course_id: int, course_data: CourseUpdate, conn = Depends(get_db_connection), current_user: dict = Depends(require_admin)) -> CourseRead:
    course = course_service.fetch_course_by_id_and_team(conn, course_id, current_user["team_id"])
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    update_data = course_data.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided for update")

    updated_course = course_service.update_course(conn, course_id, update_data)
    if not updated_course:
        raise HTTPException(status_code=404, detail="Course not found")
    return updated_course

@router.delete("/{course_id}")
def delete_course(course_id: int, conn = Depends(get_db_connection)):
    deleted = course_service.delete_course(conn, course_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Course not found")
    return {"deleted_id": deleted.get("id"), "message": "Course deleted"}