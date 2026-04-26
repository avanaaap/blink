from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException

from app.core.auth import get_current_user
from app.core.supabase import get_supabase
from app.models.message import MessageCreate, MessageResponse

router = APIRouter(prefix="/api/matches", tags=["messages"])

TYPING_TIMEOUT_SECONDS = 5


def _verify_match_member(match_id: str, user_id: str) -> dict:
    """Return the match row if user_id is a participant, else raise 403."""
    sb = get_supabase()
    result = sb.table("matches").select("*").eq("id", match_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Match not found")
    match = result.data
    if user_id not in (match["user_a"], match["user_b"]):
        raise HTTPException(status_code=403, detail="Not your match")
    return match


@router.get("/{match_id}/messages", response_model=list[MessageResponse])
async def get_messages(match_id: str, user: dict = Depends(get_current_user)):
    """List all messages in a match conversation, oldest first."""
    match = _verify_match_member(match_id, user["id"])
    sb = get_supabase()

    result = (
        sb.table("messages")
        .select("*")
        .eq("match_id", match_id)
        .order("sent_at", desc=False)
        .execute()
    )

    uid = user["id"]
    return [
        MessageResponse(
            id=msg["id"],
            text=msg["body"],
            sender="me" if msg["sender_id"] == uid else "them",
            timestamp=msg["sent_at"],
        )
        for msg in (result.data or [])
    ]


@router.post("/{match_id}/messages", response_model=MessageResponse)
async def send_message(
    match_id: str,
    payload: MessageCreate,
    user: dict = Depends(get_current_user),
):
    """Send a message in a match conversation."""
    _verify_match_member(match_id, user["id"])
    sb = get_supabase()

    now = datetime.now(timezone.utc).isoformat()
    row = {
        "match_id": match_id,
        "sender_id": user["id"],
        "body": payload.text,
        "sent_at": now,
    }
    result = sb.table("messages").insert(row).execute()

    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to send message")

    msg = result.data[0]
    return MessageResponse(
        id=msg["id"],
        text=msg["body"],
        sender="me",
        timestamp=msg["sent_at"],
    )


@router.post("/{match_id}/typing")
async def send_typing(match_id: str, user: dict = Depends(get_current_user)):
    """Signal that the current user is typing (persisted to DB)."""
    _verify_match_member(match_id, user["id"])
    sb = get_supabase()
    now = datetime.now(timezone.utc).isoformat()
    sb.table("typing_status").upsert(
        {"match_id": match_id, "user_id": user["id"], "last_typed_at": now},
        on_conflict="match_id,user_id",
    ).execute()
    return {"ok": True}


@router.get("/{match_id}/typing")
async def get_typing(match_id: str, user: dict = Depends(get_current_user)):
    """Check if the other user is currently typing (reads from DB)."""
    match = _verify_match_member(match_id, user["id"])
    sb = get_supabase()
    partner_id = match["user_b"] if match["user_a"] == user["id"] else match["user_a"]
    cutoff = (datetime.now(timezone.utc) - timedelta(seconds=TYPING_TIMEOUT_SECONDS)).isoformat()
    result = (
        sb.table("typing_status")
        .select("last_typed_at")
        .eq("match_id", match_id)
        .eq("user_id", partner_id)
        .gte("last_typed_at", cutoff)
        .execute()
    )
    return {"is_typing": bool(result.data)}
