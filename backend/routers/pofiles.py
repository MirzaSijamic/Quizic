# routers/profiles.py
from fastapi import APIRouter, Depends, HTTPException, status
from database import get_db_connection
from schemas import ProfileCreate, ProfileRead, ProfileUpdate
from services import profile_service

router = APIRouter(prefix="/api/profiles", tags=["Profiles"])

@router.get("/")
def get_profiles(conn = Depends(get_db_connection)) -> list[ProfileRead]:
    return profile_service.fetch_profiles(conn)

@router.get("/{profile_id}")
def get_profile_by_id(profile_id: int, conn = Depends(get_db_connection)) -> ProfileRead:
    profile = profile_service.fetch_profile_by_id(conn, profile_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_profile(profile_data: ProfileCreate, conn = Depends(get_db_connection)) -> ProfileRead:
    return profile_service.create_profile(conn, profile_data.model_dump())

@router.put("/{profile_id}")
def update_profile(profile_id: int, profile_data: ProfileUpdate, conn = Depends(get_db_connection)) -> ProfileRead:
    update_data = profile_data.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided for update")

    updated_profile = profile_service.update_profile(conn, profile_id, update_data)
    if not updated_profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return updated_profile

@router.delete("/{profile_id}")
def delete_profile(profile_id: int, conn = Depends(get_db_connection)):
    deleted = profile_service.delete_profile(conn, profile_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Profile not found")
    return {"deleted_id": deleted.get("id"), "message": "Profile deleted"}