from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from app.core.auth import get_current_user
from app.core.supabase import get_supabase
from app.models.match import MatchDetail, PartnerReveal, UnlockUpdate
from app.services.matching import create_match_for_user

router = APIRouter(prefix="/api/matches", tags=["matches"])


def _build_match_detail(sb, match: dict, uid: str) -> MatchDetail:
    """Build a MatchDetail from a match row and the requesting user's id."""
    partner_id = match["user_b"] if match["user_a"] == uid else match["user_a"]

    partner = (
        sb.table("profiles")
        .select("name, age, bio, interests")
        .eq("id", partner_id)
        .single()
        .execute()
    )

    partner_data = partner.data or {}

    return MatchDetail(
        id=match["id"],
        partner_name=partner_data.get("name", "Unknown"),
        partner_age=partner_data.get("age"),
        partner_bio=partner_data.get("bio", ""),
        compatibility_score=match.get("compatibility_score"),
        shared_interests=match.get("shared_interests", []),
        status=match["status"],
        unlock_level=match.get("unlock_level", 0),
    )


@router.get("/today", response_model=MatchDetail | None)
async def get_today_match(user: dict = Depends(get_current_user)):
    """Return the current user's match for today, creating one if needed."""
    sb = get_supabase()
    uid = user["id"]
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    result = (
        sb.table("matches")
        .select("*")
        .eq("match_date", today)
        .or_(f"user_a.eq.{uid},user_b.eq.{uid}")
        .neq("status", "unmatched")
        .limit(1)
        .execute()
    )

    if result.data:
        return _build_match_detail(sb, result.data[0], uid)

    # No active match — run the matching algorithm on demand
    new_match = await create_match_for_user(sb, uid)
    if not new_match:
        return None

    return _build_match_detail(sb, new_match, uid)


@router.get("/all", response_model=list[MatchDetail])
async def get_all_matches(user: dict = Depends(get_current_user)):
    """Return all non-unmatched matches for the current user (excluding today's)."""
    sb = get_supabase()
    uid = user["id"]
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    result = (
        sb.table("matches")
        .select("*")
        .or_(f"user_a.eq.{uid},user_b.eq.{uid}")
        .neq("status", "unmatched")
        .neq("match_date", today)
        .order("created_at", desc=True)
        .limit(50)
        .execute()
    )

    return [_build_match_detail(sb, m, uid) for m in (result.data or [])]


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


@router.post("/{match_id}/decline")
async def decline_match(
    match_id: str,
    user: dict = Depends(get_current_user),
):
    """Decline / end a match — sets status to unmatched."""
    sb = get_supabase()
    uid = user["id"]

    match_row = (
        sb.table("matches").select("*").eq("id", match_id).single().execute()
    )
    if not match_row.data:
        raise HTTPException(status_code=404, detail="Match not found")

    match = match_row.data
    if uid not in (match["user_a"], match["user_b"]):
        raise HTTPException(status_code=403, detail="Not your match")

    if match["status"] == "unmatched":
        raise HTTPException(status_code=400, detail="Match already ended")

    sb.table("matches").update({"status": "unmatched"}).eq("id", match_id).execute()
    return {"detail": "Match declined"}


@router.get("/{match_id}/reveal", response_model=PartnerReveal)
async def get_partner_reveal(
    match_id: str,
    user: dict = Depends(get_current_user),
):
    """Return partner's full profile + photos. Only available at unlock_level >= 4."""
    sb = get_supabase()
    uid = user["id"]

    match_row = (
        sb.table("matches").select("*").eq("id", match_id).single().execute()
    )
    if not match_row.data:
        raise HTTPException(status_code=404, detail="Match not found")

    match = match_row.data
    if uid not in (match["user_a"], match["user_b"]):
        raise HTTPException(status_code=403, detail="Not your match")

    if match.get("unlock_level", 0) < 4:
        raise HTTPException(status_code=403, detail="Profile not yet revealed")

    partner_id = match["user_b"] if match["user_a"] == uid else match["user_a"]

    partner = (
        sb.table("profiles")
        .select("name, age, bio, interests")
        .eq("id", partner_id)
        .single()
        .execute()
    )
    partner_data = partner.data or {}

    photos = (
        sb.table("photos")
        .select("url, caption")
        .eq("user_id", partner_id)
        .order("sort_order")
        .execute()
    )

    return PartnerReveal(
        name=partner_data.get("name", "Unknown"),
        age=partner_data.get("age"),
        bio=partner_data.get("bio", ""),
        interests=partner_data.get("interests", ""),
        compatibility_score=match.get("compatibility_score"),
        photos=[
            {"url": p["url"], "caption": p.get("caption")}
            for p in (photos.data or [])
        ],
    )
