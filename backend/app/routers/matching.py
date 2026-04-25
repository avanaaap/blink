"""Router for the daily matching algorithm and rating feedback."""

from fastapi import APIRouter, Depends, HTTPException

from app.core.auth import get_current_user
from app.services.matching import process_rating_feedback, run_daily_matching

router = APIRouter(prefix="/api/matching", tags=["matching"])


@router.post("/run")
async def trigger_daily_matching():
    """Trigger the daily matching algorithm.

    In production this is invoked by a Supabase Edge Function cron job.
    The endpoint uses the service-role Supabase client internally, so no
    user auth is required — secure it at the infrastructure level
    (e.g. Supabase Edge Function secret, API gateway, or internal network).
    """
    try:
        matches = await run_daily_matching()
        return {"created": len(matches), "matches": matches}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.post("/feedback")
async def submit_rating_feedback(
    interaction_id: str,
    rating: int,
    user: dict = Depends(get_current_user),
):
    """Process a rating and return weight-adjustment signals.

    Called after the regular ``POST /api/ratings`` endpoint so the
    feedback loop can run asynchronously without blocking the rating
    submission itself.
    """
    if not 1 <= rating <= 5:
        raise HTTPException(status_code=400, detail="Rating must be 1-5")

    adjustment = await process_rating_feedback(user["id"], rating, interaction_id)
    if adjustment is None:
        return {"status": "insufficient_data"}
    return {"status": "ok", "adjustment": adjustment}
