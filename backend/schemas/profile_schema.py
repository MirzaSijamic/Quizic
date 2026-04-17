from pydantic import BaseModel


class ProfileBase(BaseModel):
    full_name: str
    email: str
    role: str
    team_id: int


class ProfileCreate(ProfileBase):
    pass


class ProfileUpdate(BaseModel):
    full_name: str | None = None
    email: str | None = None
    role: str | None = None
    team_id: int | None = None


class ProfileRead(ProfileBase):
    id: int
