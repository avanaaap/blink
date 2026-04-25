"""Router for the daily matching algorithm and stage decisions."""

from fastapi import APIRouter, Depends, HTTPException

from app.core.auth import get_current_user
from app.models.stage_decision import StageDecisionCreate, StageDecisionResponse
from app.services.matching import run_daily_matching, submit_stage_decision

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


@router.post("/decide", response_model=StageDecisionResponse)
async def decide_stage(
    payload: StageDecisionCreate,
    user: dict = Depends(get_current_user),
):
    """Submit a stage decision for the current conversation phase.

    Each user picks one of: ``move_forward``, ``not_sure``, or
    ``dont_move_forward``.  Once both users have decided:

    - If either chose ``dont_move_forward`` the match status becomes
      ``unmatched``.
    - Otherwise the match's ``unlock_level`` advances by one
      (text → call → video → revealed → connected).
    """
    try:
        result = await submit_stage_decision(
            user_id=user["id"],
            match_id=payload.match_id,
            decision=payload.decision.value,
        )
        return result
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc
