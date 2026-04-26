from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from app.core.auth import get_current_user
from app.core.supabase import get_supabase
from app.models.match import MatchDetail, UnlockUpdate
from app.services.matching import create_match_for_user

router = APIRouter(prefix="/api/matches", tags=["matches"])


def _build_match_detail(sb, match: dict, uid: str) -> MatchDetail:
    """Build a MatchDetail from a match row and the requesting user's id."""
    partner_id = match["user_b"] if match["user_a"] == uid else match["user_a"]

    partner = (
        sb.table("profiles")
        .select("name, age, interests")
        .eq("id", partner_id)
        .single()
        .execute()
    )

    partner_data = partner.data or {}
    partner_interests = partner_data.get("interests", [])
    user_profile = (
        sb.table("profiles")
        .select("interests")
        .eq("id", uid)
        .single()
        .execute()
    )
    user_interests = (user_profile.data or {}).get("interests", [])
    shared = list(set(partner_interests) & set(user_interests))

    return MatchDetail(
        id=match["id"],
        partner_name=partner_data.get("name", "Unknown"),
        partner_age=partner_data.get("age"),
        compatibility_score=match.get("compatibility_score"),
        shared_interests=shared or match.get("shared_interests", []),
        status=match["status"],
        unlock_level=match.get("unlock_level", 0),
    )


@router.get("/today", response_model=MatchDetail | None)
async def get_today_match(user: dict = Depends(get_current_user)):
    """Return the current user's match for today, creating one if needed."""
    sb = get_supabase()
    uid = user["id"]
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    # Check for existing match today
    result = (
        sb.table("matches")
        .select("*")
        .eq("match_date", today)
        .or_(f"user_a.eq.{uid},user_b.eq.{uid}")
        .eq("status", "active")
        .limit(1)
        .execute()
    )

    if result.data:
        return _build_match_detail(sb, result.data[0], uid)

    # No match yet — run the matching algorithm
    new_match = create_match_for_user(sb, uid)
    if not new_match:
        return None

    return _build_match_detail(sb, new_match, uid)


@router.patch("/{match_id}/unlock", response_model=MatchDetail)
async def update_unlock_level(
    match_id: str,
    payload: UnlockUpdate,
    user: dict = Depends(get_current_user),
):
    """Advance the unlock level for a match (chat → voice → video → reveal)."""
    sb = get_supabase()
    uid = user["id"]

    # Verify the user is part of this match
    match_row = (
        sb.table("matches").select("*").eq("id", match_id).single().execute()
    )
    if not match_row.data:
        raise HTTPException(status_code=404, detail="Match not found")

    match = match_row.data
    if uid not in (match["user_a"], match["user_b"]):
        raise HTTPException(status_code=403, detail="Not your match")

    if payload.unlock_level <= match.get("unlock_level", 0):
        raise HTTPException(
            status_code=400, detail="Cannot decrease unlock level"
        )

    sb.table("matches").update(
        {"unlock_level": payload.unlock_level}
    ).eq("id", match_id).execute()

    partner_id = match["user_b"] if match["user_a"] == uid else match["user_a"]
    partner = (
        sb.table("profiles")
        .select("name, age")
        .eq("id", partner_id)
        .single()
        .execute()
    )
    partner_data = partner.data or {}

    return MatchDetail(
        id=match["id"],
        partner_name=partner_data.get("name", "Unknown"),
        partner_age=partner_data.get("age"),
        compatibility_score=match.get("compatibility_score"),
        shared_interests=match.get("shared_interests", []),
        status=match["status"],
        unlock_level=payload.unlock_level,
    )
