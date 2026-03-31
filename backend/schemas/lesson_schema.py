from pydantic import BaseModel


class LessonBase(BaseModel):
    course_id: int
    name: str
    video_link: str | None = None
    material_link: str | None = None


class LessonCreate(LessonBase):
    pass


class LessonUpdate(BaseModel):
    course_id: int | None = None
    name: str | None = None
    video_link: str | None = None
    material_link: str | None = None


class LessonRead(LessonBase):
    id: int
