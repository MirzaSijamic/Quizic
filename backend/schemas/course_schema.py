from pydantic import BaseModel


class CourseBase(BaseModel):
    name: str
    difficulty: str | None = None


class CourseCreate(CourseBase):
    pass


class CourseUpdate(BaseModel):
    name: str | None = None
    difficulty: str | None = None


class CourseRead(CourseBase):
    id: int
