"""Router for Agora RTC token generation with unlock-level gating."""

from __future__ import annotations

import random
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.core.auth import get_current_user
from app.core.config import settings
from app.core.supabase import get_supabase
from app.services.agora import generate_rtc_token, match_channel_name

router = APIRouter(prefix="/api/agora", tags=["agora"])

# Minimum unlock_level required per call mode
_MODE_MIN_LEVEL = {
    "voice": 2,
    "video": 3,
}


class TokenRequest(BaseModel):
    match_id: str
    mode: str  # "voice" or "video"


class TokenResponse(BaseModel):
    token: str
    channel: str
    uid: int
    app_id: str
    interaction_id: str | None = None


@router.post("/token", response_model=TokenResponse)
async def get_agora_token(
    payload: TokenRequest,
    user: dict = Depends(get_current_user),
):
    """Generate an Agora RTC token for a matched voice or video call.

    Enforces unlock-level gating:
      - ``voice`` requires ``unlock_level >= 2``
      - ``video`` requires ``unlock_level >= 3``
    """
    if payload.mode not in _MODE_MIN_LEVEL:
        raise HTTPException(
            status_code=400,
            detail="mode must be 'voice' or 'video'",
        )

    sb = get_supabase()
    uid = user["id"]

    # Fetch the match and verify membership
    match_row = (
        sb.table("matches")
        .select("id, user_a, user_b, unlock_level, status")
        .eq("id", payload.match_id)
        .single()
        .execute()
    )
    if not match_row.data:
        raise HTTPException(status_code=404, detail="Match not found")

    match = match_row.data
    if uid not in (match["user_a"], match["user_b"]):
        raise HTTPException(status_code=403, detail="Not your match")

    if match.get("status") not in ("pending", "active", "connected"):
        raise HTTPException(
            status_code=400,
            detail="Match is no longer active",
        )

    # Unlock-level gating
    current_level = match.get("unlock_level", 0)
    required_level = _MODE_MIN_LEVEL[payload.mode]
    if current_level < required_level:
        raise HTTPException(
            status_code=403,
            detail=(
                f"{payload.mode} calls require unlock_level >= "
                f"{required_level} (current: {current_level})"
            ),
        )

    # Generate a numeric UID for Agora (deterministic per user per match)
    agora_uid = random.Random(f"{uid}-{payload.match_id}").randint(
        1, 2**31 - 1
    )
    channel = match_channel_name(payload.match_id)
    token = generate_rtc_token(channel, agora_uid)

    # Create an interaction row so the call is tracked
    interaction_result = (
        sb.table("interactions")
        .insert(
            {
                "match_id": payload.match_id,
                "interaction_type": payload.mode,
                "started_at": datetime.now(timezone.utc).isoformat(),
            }
        )
        .execute()
    )
    interaction_id = None
    if interaction_result.data:
        interaction_id = interaction_result.data[0].get("id")

    return TokenResponse(
        token=token,
        channel=channel,
        uid=agora_uid,
        app_id=settings.agora_app_id,
        interaction_id=interaction_id,
    )
