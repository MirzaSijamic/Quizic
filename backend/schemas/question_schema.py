from typing import Any

from pydantic import BaseModel


class QuestionBase(BaseModel):
    quiz_id: int
    question_text: str
    answers: Any
    correct_answer: str


class QuestionCreate(QuestionBase):
    pass


class QuestionUpdate(BaseModel):
    quiz_id: int | None = None
    question_text: str | None = None
    answers: Any | None = None
    correct_answer: str | None = None


class QuestionRead(QuestionBase):
    id: int
