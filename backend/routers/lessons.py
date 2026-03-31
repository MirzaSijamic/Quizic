from fastapi import APIRouter, Depends, HTTPException, status
from database import get_db_connection
from schemas import LessonCreate, LessonRead, LessonUpdate
from services import lesson_service

router = APIRouter(prefix="/api/lessons", tags=["Lessons"])


@router.get("/")
def get_lessons(conn=Depends(get_db_connection)) -> list[LessonRead]:
    return lesson_service.fetch_lessons(conn)


@router.get("/{lesson_id}")
def get_lesson_by_id(lesson_id: int, conn=Depends(get_db_connection)) -> LessonRead:
    lesson = lesson_service.fetch_lesson_by_id(conn, lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lesson


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_lesson(lesson_data: LessonCreate, conn=Depends(get_db_connection)) -> LessonRead:
    return lesson_service.create_lesson(conn, lesson_data.model_dump())


@router.put("/{lesson_id}")
def update_lesson(lesson_id: int, lesson_data: LessonUpdate, conn=Depends(get_db_connection)) -> LessonRead:
    update_data = lesson_data.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided for update")

    updated_lesson = lesson_service.update_lesson(conn, lesson_id, update_data)
    if not updated_lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return updated_lesson


@router.delete("/{lesson_id}")
def delete_lesson(lesson_id: int, conn=Depends(get_db_connection)):
    deleted = lesson_service.delete_lesson(conn, lesson_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return {"deleted_id": deleted.get("id"), "message": "Lesson deleted"}
