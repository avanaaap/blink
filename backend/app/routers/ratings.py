from fastapi import APIRouter, Depends, HTTPException

from app.core.auth import get_current_user
from app.core.supabase import get_supabase
from app.models.rating import RatingCreate, RatingResponse

router = APIRouter(prefix="/api/ratings", tags=["ratings"])


@router.post("", response_model=RatingResponse)
async def create_rating(
    payload: RatingCreate, user: dict = Depends(get_current_user)
):
    sb = get_supabase()

    # Verify the interaction exists and belongs to a match the user is in
    interaction = (
        sb.table("interactions")
        .select("*, matches(user_a, user_b)")
        .eq("id", payload.interaction_id)
        .single()
        .execute()
    )
    if not interaction.data:
        raise HTTPException(status_code=404, detail="Interaction not found")

    match_data = interaction.data.get("matches", {})
    if user["id"] not in (match_data.get("user_a"), match_data.get("user_b")):
        raise HTTPException(status_code=403, detail="Not your interaction")

    result = (
        sb.table("ratings")
        .insert(
            {
                "interaction_id": payload.interaction_id,
                "rater_id": user["id"],
                "rating": payload.rating,
                "feedback": payload.feedback,
            }
        )
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create rating")

    return result.data[0]
