from fastapi import APIRouter, Depends, HTTPException, status
from database import get_db_connection
from schemas import ProfileCourseCreate, ProfileCourseRead, ProfileCourseUpdate
from services import profile_course_service

router = APIRouter(prefix="/api/profile-courses", tags=["Profile Courses"])


@router.get("/")
def get_profile_courses(conn=Depends(get_db_connection)) -> list[ProfileCourseRead]:
    return profile_course_service.fetch_profile_courses(conn)


@router.get("/{profile_course_id}")
def get_profile_course_by_id(profile_course_id: int, conn=Depends(get_db_connection)) -> ProfileCourseRead:
    profile_course = profile_course_service.fetch_profile_course_by_id(conn, profile_course_id)
    if not profile_course:
        raise HTTPException(status_code=404, detail="Profile-course relation not found")
    return profile_course

@router.get("/profile/{profile_id}")
def get_profile_course_by_profile_id(profile_id: int, conn=Depends(get_db_connection)) -> list[ProfileCourseRead]:
    profile_courses = profile_course_service.fetch_profile_courses_by_profile_id(conn, profile_id)
    return profile_courses


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_profile_course(profile_course_data: ProfileCourseCreate, conn=Depends(get_db_connection)) -> ProfileCourseRead:
    return profile_course_service.create_profile_course(conn, profile_course_data.model_dump())


@router.put("/{profile_course_id}")
def update_profile_course(profile_course_id: int, profile_course_data: ProfileCourseUpdate, conn=Depends(get_db_connection)) -> ProfileCourseRead:
    update_data = profile_course_data.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided for update")

    updated_profile_course = profile_course_service.update_profile_course(conn, profile_course_id, update_data)
    if not updated_profile_course:
        raise HTTPException(status_code=404, detail="Profile-course relation not found")
    return updated_profile_course


@router.delete("/{profile_course_id}")
def delete_profile_course(profile_course_id: int, conn=Depends(get_db_connection)):
    deleted = profile_course_service.delete_profile_course(conn, profile_course_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Profile-course relation not found")
    return {"deleted_id": deleted.get("id"), "message": "Profile-course relation deleted"}

@router.get("/profile/{profile_id}/completion-status")
def get_course_completion_status(profile_id: int, conn=Depends(get_db_connection)):
    return profile_course_service.get_course_completion_status(conn, profile_id)
