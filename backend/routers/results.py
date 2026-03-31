from fastapi import APIRouter, Depends, HTTPException, status
from database import get_db_connection
from schemas import ResultCreate, ResultRead, ResultSubmitRequest, ResultSubmitResponse, ResultUpdate
from services import result_service

router = APIRouter(prefix="/api/results", tags=["Results"])


@router.get("/")
def get_results(conn=Depends(get_db_connection)) -> list[ResultRead]:
    return result_service.fetch_results(conn)


@router.post("/submit", status_code=status.HTTP_201_CREATED)
def submit_quiz_result(submit_data: ResultSubmitRequest, conn=Depends(get_db_connection)) -> ResultSubmitResponse:
    submission_result = result_service.submit_quiz_result(conn, submit_data.model_dump())

    if submission_result is None:
        raise HTTPException(status_code=404, detail="Quiz not found")

    if submission_result.get("error"):
        raise HTTPException(
            status_code=submission_result.get("status_code", 400),
            detail=submission_result["error"],
        )

    return submission_result


@router.get("/{result_id}")
def get_result_by_id(result_id: int, conn=Depends(get_db_connection)) -> ResultRead:
    result = result_service.fetch_result_by_id(conn, result_id)
    if not result:
        raise HTTPException(status_code=404, detail="Result not found")
    return result


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_result(result_data: ResultCreate, conn=Depends(get_db_connection)) -> ResultRead:
    return result_service.create_result(conn, result_data.model_dump())


@router.put("/{result_id}")
def update_result(result_id: int, result_data: ResultUpdate, conn=Depends(get_db_connection)) -> ResultRead:
    update_data = result_data.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided for update")

    updated_result = result_service.update_result(conn, result_id, update_data)
    if not updated_result:
        raise HTTPException(status_code=404, detail="Result not found")
    return updated_result


@router.delete("/{result_id}")
def delete_result(result_id: int, conn=Depends(get_db_connection)):
    deleted = result_service.delete_result(conn, result_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Result not found")
    return {"deleted_id": deleted.get("id"), "message": "Result deleted"}
