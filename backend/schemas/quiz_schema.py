from pydantic import BaseModel


class QuizBase(BaseModel):
    lesson_id: int
    title: str
    passing_score: int


class QuizCreate(QuizBase):
    pass


class QuizUpdate(BaseModel):
    lesson_id: int | None = None
    title: str | None = None
    passing_score: int | None = None


class QuizRead(QuizBase):
    id: int
