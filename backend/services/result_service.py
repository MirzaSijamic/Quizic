from datetime import datetime

from crud.result_crud import get_next_attempt_num, result_crud
from services.question_service import fetch_questions_by_quiz_id
from services.quiz_service import fetch_quiz_by_id


def fetch_results(conn):
    return result_crud.get_all(conn)


def fetch_result_by_id(conn, result_id: int):
    return result_crud.get_by_id(conn, result_id)


def create_result(conn, result_data: dict):
    return result_crud.create(conn, result_data)


def update_result(conn, result_id: int, result_data: dict):
    return result_crud.update(conn, result_id, result_data)


def delete_result(conn, result_id: int):
    return result_crud.delete(conn, result_id)


def submit_quiz_result(conn, submit_data: dict):
    profile_id = submit_data["profile_id"]
    quiz_id = submit_data["quiz_id"]
    answers = submit_data.get("answers", [])

    quiz = fetch_quiz_by_id(conn, quiz_id)
    if not quiz:
        return None

    questions = fetch_questions_by_quiz_id(conn, quiz_id)
    if not questions:
        return {
            "error": "No questions found for this quiz",
            "status_code": 404,
        }

    selected_answer_by_question_id = {
        answer["question_id"]: answer["selected_answer"]
        for answer in answers
    }

    valid_question_ids = {question["id"] for question in questions}
    submitted_question_ids = set(selected_answer_by_question_id.keys())
    invalid_question_ids = submitted_question_ids - valid_question_ids
    if invalid_question_ids:
        return {
            "error": f"Submitted answers contain invalid question IDs for this quiz: {sorted(invalid_question_ids)}",
            "status_code": 400,
        }

    number_correct = 0
    for question in questions:
        selected = selected_answer_by_question_id.get(question["id"])
        if selected is not None and str(selected) == str(question["correct_answer"]):
            number_correct += 1

    total_questions = len(questions)
    score = round((number_correct / total_questions) * 100, 2)
    passing_score = int(quiz["passing_score"])
    passed = score >= passing_score
    attempt_num = get_next_attempt_num(conn, profile_id, quiz_id)

    created_result = create_result(
        conn,
        {
            "profile_id": profile_id,
            "quiz_id": quiz_id,
            "score": score,
            "passed": passed,
            "attempt_num": attempt_num,
            "completed_at": datetime.utcnow(),
            "number_correct": number_correct,
            "total_questions": total_questions,
        },
    )

    return {
        "result_id": created_result["id"],
        "profile_id": profile_id,
        "quiz_id": quiz_id,
        "number_correct": number_correct,
        "total_questions": total_questions,
        "score": score,
        "passing_score": passing_score,
        "passed": passed,
        "attempt_num": attempt_num,
    }
