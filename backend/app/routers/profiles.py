from fastapi import APIRouter, Depends, HTTPException

from app.core.auth import get_current_user
from app.core.supabase import get_supabase
from app.models.profile import ProfileResponse, ProfileUpdate

router = APIRouter(prefix="/api/profiles", tags=["profiles"])


@router.get("/me", response_model=ProfileResponse)
async def get_my_profile(user: dict = Depends(get_current_user)):
    sb = get_supabase()
    result = sb.table("profiles").select("*").eq("id", user["id"]).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    return result.data


@router.patch("/me", response_model=ProfileResponse)
async def update_my_profile(
    payload: ProfileUpdate, user: dict = Depends(get_current_user)
):
    sb = get_supabase()

    update_data = payload.model_dump(exclude_none=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    result = (
        sb.table("profiles")
        .update(update_data)
        .eq("id", user["id"])
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    return result.data[0]


@router.get("/{user_id}", response_model=ProfileResponse)
async def get_profile(user_id: str, user: dict = Depends(get_current_user)):
    """Get another user's profile (only if they are a current match)."""
    sb = get_supabase()

    # Verify the requesting user has an active match with this user
    uid = user["id"]
    user_a, user_b = (min(uid, user_id), max(uid, user_id))
    match_check = (
        sb.table("matches")
        .select("id")
        .eq("user_a", user_a)
        .eq("user_b", user_b)
        .eq("status", "active")
        .execute()
    )
    if not match_check.data:
        raise HTTPException(
            status_code=403, detail="You can only view profiles of your matches"
        )

    result = sb.table("profiles").select("*").eq("id", user_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    return result.data
