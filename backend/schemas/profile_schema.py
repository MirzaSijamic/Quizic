from pydantic import BaseModel


class ProfileBase(BaseModel):
    full_name: str
    email: str
    role: str


class ProfileCreate(ProfileBase):
    pass


class ProfileUpdate(BaseModel):
    full_name: str | None = None
    email: str | None = None
    role: str | None = None


class ProfileRead(ProfileBase):
    id: int
