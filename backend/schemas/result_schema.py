from datetime import datetime

from pydantic import BaseModel


class SubmittedAnswer(BaseModel):
    question_id: int
    selected_answer: str


class ResultBase(BaseModel):
    profile_id: int
    quiz_id: int
    score: float | None = None
    passed: bool
    attempt_num: int
    completed_at: datetime | None = None
    number_correct: int
    total_questions: int


class ResultCreate(ResultBase):
    pass


class ResultUpdate(BaseModel):
    profile_id: int | None = None
    quiz_id: int | None = None
    score: float | None = None
    passed: bool | None = None
    attempt_num: int | None = None
    completed_at: datetime | None = None
    number_correct: int | None = None
    total_questions: int | None = None


class ResultRead(ResultBase):
    id: int


class ResultSubmitRequest(BaseModel):
    profile_id: int
    quiz_id: int
    answers: list[SubmittedAnswer]


class ResultSubmitResponse(BaseModel):
    result_id: int
    profile_id: int
    quiz_id: int
    number_correct: int
    total_questions: int
    score: float
    passing_score: int
    passed: bool
    attempt_num: int
