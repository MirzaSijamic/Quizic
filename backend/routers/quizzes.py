from fastapi import APIRouter, Depends, HTTPException, status
from database import get_db_connection
from schemas import QuizCreate, QuizRead, QuizUpdate
from services import quiz_service

router = APIRouter(prefix="/api/quizzes", tags=["Quizzes"])


@router.get("/")
def get_quizzes(conn=Depends(get_db_connection)) -> list[QuizRead]:
    return quiz_service.fetch_quizzes(conn)


@router.get("/{quiz_id}")
def get_quiz_by_id(quiz_id: int, conn=Depends(get_db_connection)) -> QuizRead:
    quiz = quiz_service.fetch_quiz_by_id(conn, quiz_id)
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return quiz


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_quiz(quiz_data: QuizCreate, conn=Depends(get_db_connection)) -> QuizRead:
    return quiz_service.create_quiz(conn, quiz_data.model_dump())


@router.put("/{quiz_id}")
def update_quiz(quiz_id: int, quiz_data: QuizUpdate, conn=Depends(get_db_connection)) -> QuizRead:
    update_data = quiz_data.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided for update")

    updated_quiz = quiz_service.update_quiz(conn, quiz_id, update_data)
    if not updated_quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return updated_quiz


@router.delete("/{quiz_id}")
def delete_quiz(quiz_id: int, conn=Depends(get_db_connection)):
    deleted = quiz_service.delete_quiz(conn, quiz_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return {"deleted_id": deleted.get("id"), "message": "Quiz deleted"}
