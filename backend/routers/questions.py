from fastapi import APIRouter, Depends, HTTPException, status
from database import get_db_connection
from schemas import QuestionCreate, QuestionRead, QuestionUpdate
from services import question_service

router = APIRouter(prefix="/api/questions", tags=["Questions"])


@router.get("/")
def get_questions(conn=Depends(get_db_connection)) -> list[QuestionRead]:
    return question_service.fetch_questions(conn)


@router.get("/quiz/{quiz_id}")
def get_questions_by_quiz_id(quiz_id: int, conn=Depends(get_db_connection)) -> list[QuestionRead]:
    questions = question_service.fetch_questions_by_quiz_id(conn, quiz_id)
    if not questions:
        raise HTTPException(status_code=404, detail="No questions found for this quiz")
    return questions


@router.get("/{question_id}")
def get_question_by_id(question_id: int, conn=Depends(get_db_connection)) -> QuestionRead:
    question = question_service.fetch_question_by_id(conn, question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    return question


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_question(question_data: QuestionCreate, conn=Depends(get_db_connection)) -> QuestionRead:
    return question_service.create_question(conn, question_data.model_dump())


@router.put("/{question_id}")
def update_question(question_id: int, question_data: QuestionUpdate, conn=Depends(get_db_connection)) -> QuestionRead:
    update_data = question_data.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided for update")

    updated_question = question_service.update_question(conn, question_id, update_data)
    if not updated_question:
        raise HTTPException(status_code=404, detail="Question not found")
    return updated_question


@router.delete("/{question_id}")
def delete_question(question_id: int, conn=Depends(get_db_connection)):
    deleted = question_service.delete_question(conn, question_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Question not found")
    return {"deleted_id": deleted.get("id"), "message": "Question deleted"}
