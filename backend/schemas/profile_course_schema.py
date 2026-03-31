from pydantic import BaseModel


class ProfileCourseBase(BaseModel):
    profile_id: int
    course_id: int
    completed: bool | None = None


class ProfileCourseCreate(ProfileCourseBase):
    pass


class ProfileCourseUpdate(BaseModel):
    profile_id: int | None = None
    course_id: int | None = None
    completed: bool | None = None


class ProfileCourseRead(ProfileCourseBase):
    id: int
