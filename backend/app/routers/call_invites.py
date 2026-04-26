"""Call invite endpoints: ring a match partner for a voice/video call."""

from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.core.auth import get_current_user
from app.core.supabase import get_supabase

router = APIRouter(prefix="/api/calls", tags=["calls"])

INVITE_EXPIRY_SECONDS = 60  # invites expire after 60 seconds


class CallInviteCreate(BaseModel):
    match_id: str
    mode: str  # "voice" or "video"


class CallInviteResponse(BaseModel):
    id: str
    match_id: str
    caller_id: str
    callee_id: str
    mode: str
    status: str
    created_at: str | None = None


class CallInviteAction(BaseModel):
    action: str  # "accept" or "decline"


@router.post("/invite", response_model=CallInviteResponse)
async def create_call_invite(
    payload: CallInviteCreate,
    user: dict = Depends(get_current_user),
):
    """Ring the match partner for a call."""
    sb = get_supabase()
    uid = user["id"]

    # Verify match and get partner
    match_row = (
        sb.table("matches").select("*").eq("id", payload.match_id).single().execute()
    )
    if not match_row.data:
        raise HTTPException(status_code=404, detail="Match not found")

    match = match_row.data
    if uid not in (match["user_a"], match["user_b"]):
        raise HTTPException(status_code=403, detail="Not your match")

    partner_id = match["user_b"] if match["user_a"] == uid else match["user_a"]

    # Expire any old pending invites for this match
    cutoff = (datetime.now(timezone.utc) - timedelta(seconds=INVITE_EXPIRY_SECONDS)).isoformat()
    sb.table("call_invites").update(
        {"status": "expired", "responded_at": datetime.now(timezone.utc).isoformat()}
    ).eq("match_id", payload.match_id).eq("status", "pending").lt("created_at", cutoff).execute()

    # Check if there's already a pending invite for this match
    existing = (
        sb.table("call_invites")
        .select("*")
        .eq("match_id", payload.match_id)
        .eq("status", "pending")
        .limit(1)
        .execute()
    )
    if existing.data:
        invite = existing.data[0]
        return CallInviteResponse(
            id=invite["id"],
            match_id=invite["match_id"],
            caller_id=invite["caller_id"],
            callee_id=invite["callee_id"],
            mode=invite["mode"],
            status=invite["status"],
            created_at=invite.get("created_at"),
        )

    # Create new invite
    row = {
        "match_id": payload.match_id,
        "caller_id": uid,
        "callee_id": partner_id,
        "mode": payload.mode,
        "status": "pending",
    }
    result = sb.table("call_invites").insert(row).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create invite")

    invite = result.data[0]
    return CallInviteResponse(
        id=invite["id"],
        match_id=invite["match_id"],
        caller_id=invite["caller_id"],
        callee_id=invite["callee_id"],
        mode=invite["mode"],
        status=invite["status"],
        created_at=invite.get("created_at"),
    )


@router.get("/pending", response_model=CallInviteResponse | None)
async def get_pending_invite(user: dict = Depends(get_current_user)):
    """Check if there's an incoming call invite for the current user."""
    sb = get_supabase()
    uid = user["id"]

    # Expire old invites first
    cutoff = (datetime.now(timezone.utc) - timedelta(seconds=INVITE_EXPIRY_SECONDS)).isoformat()
    sb.table("call_invites").update(
        {"status": "expired", "responded_at": datetime.now(timezone.utc).isoformat()}
    ).eq("callee_id", uid).eq("status", "pending").lt("created_at", cutoff).execute()

    result = (
        sb.table("call_invites")
        .select("*")
        .eq("callee_id", uid)
        .eq("status", "pending")
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )

    if not result.data:
        return None

    invite = result.data[0]
    return CallInviteResponse(
        id=invite["id"],
        match_id=invite["match_id"],
        caller_id=invite["caller_id"],
        callee_id=invite["callee_id"],
        mode=invite["mode"],
        status=invite["status"],
        created_at=invite.get("created_at"),
    )


@router.patch("/invite/{invite_id}", response_model=CallInviteResponse)
async def respond_to_invite(
    invite_id: str,
    payload: CallInviteAction,
    user: dict = Depends(get_current_user),
):
    """Accept or decline a call invite."""
    sb = get_supabase()
    uid = user["id"]

    invite_row = (
        sb.table("call_invites").select("*").eq("id", invite_id).single().execute()
    )
    if not invite_row.data:
        raise HTTPException(status_code=404, detail="Invite not found")

    invite = invite_row.data
    if invite["callee_id"] != uid:
        raise HTTPException(status_code=403, detail="Not your invite")

    if invite["status"] != "pending":
        raise HTTPException(status_code=400, detail=f"Invite already {invite['status']}")

    new_status = "accepted" if payload.action == "accept" else "declined"
    sb.table("call_invites").update(
        {"status": new_status, "responded_at": datetime.now(timezone.utc).isoformat()}
    ).eq("id", invite_id).execute()

    return CallInviteResponse(
        id=invite["id"],
        match_id=invite["match_id"],
        caller_id=invite["caller_id"],
        callee_id=invite["callee_id"],
        mode=invite["mode"],
        status=new_status,
        created_at=invite.get("created_at"),
    )


@router.get("/invite/{invite_id}/status", response_model=CallInviteResponse)
async def check_invite_status(
    invite_id: str,
    user: dict = Depends(get_current_user),
):
    """Poll the status of an outgoing invite (for the caller to know when callee responds)."""
    sb = get_supabase()

    invite_row = (
        sb.table("call_invites").select("*").eq("id", invite_id).single().execute()
    )
    if not invite_row.data:
        raise HTTPException(status_code=404, detail="Invite not found")

    invite = invite_row.data

    # Auto-expire if too old
    created = datetime.fromisoformat(invite["created_at"].replace("Z", "+00:00"))
    if (
        invite["status"] == "pending"
        and datetime.now(timezone.utc) - created > timedelta(seconds=INVITE_EXPIRY_SECONDS)
    ):
        sb.table("call_invites").update(
            {"status": "expired", "responded_at": datetime.now(timezone.utc).isoformat()}
        ).eq("id", invite_id).execute()
        invite["status"] = "expired"

    return CallInviteResponse(
        id=invite["id"],
        match_id=invite["match_id"],
        caller_id=invite["caller_id"],
        callee_id=invite["callee_id"],
        mode=invite["mode"],
        status=invite["status"],
        created_at=invite.get("created_at"),
    )
