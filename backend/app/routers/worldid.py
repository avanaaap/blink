"""
World ID verification routes.

1. POST /api/worldid/rp-signature  — generate a signed RP request for IDKit
2. POST /api/worldid/verify-proof  — verify the proof with World ID and store the nullifier
"""

import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.core.auth import get_current_user
from app.core.config import settings
from app.core.supabase import get_supabase
from app.services.worldid import sign_rp_request

router = APIRouter(prefix="/api/worldid", tags=["worldid"])


# ---- request / response models ----

class RpSignatureRequest(BaseModel):
    action: str = "verify-blink-user"


class RpSignatureResponse(BaseModel):
    sig: str
    nonce: str
    created_at: int
    expires_at: int


class VerifyProofRequest(BaseModel):
    idkit_response: dict


# ---- routes ----

@router.post("/rp-signature", response_model=RpSignatureResponse)
async def rp_signature(payload: RpSignatureRequest):
    if not settings.worldid_rp_signing_key:
        raise HTTPException(status_code=500, detail="RP signing key not configured")

    result = sign_rp_request(
        signing_key_hex=settings.worldid_rp_signing_key,
        action=payload.action,
    )
    return result


@router.post("/verify-proof")
async def verify_proof(
    payload: VerifyProofRequest,
    user: dict = Depends(get_current_user),
):
    if not settings.worldid_rp_id:
        raise HTTPException(status_code=500, detail="World ID RP ID not configured")

    idkit_response = payload.idkit_response

    # Call World ID verification API
    async with httpx.AsyncClient() as client:
        world_res = await client.post(
            f"https://developer.world.org/api/v4/verify/{settings.worldid_rp_id}",
            json=idkit_response,
            headers={"Content-Type": "application/json"},
        )

    if not world_res.is_success:
        raise HTTPException(status_code=400, detail="World ID verification failed")

    # Extract nullifier from the first response
    responses = idkit_response.get("responses", [])
    if not responses:
        raise HTTPException(status_code=400, detail="No proof responses found")

    nullifier_raw = responses[0].get("nullifier", "")
    nullifier_decimal = str(int(nullifier_raw, 16)) if nullifier_raw.startswith("0x") else nullifier_raw

    sb = get_supabase()
    user_id = user["id"]

    # Store nullifier — unique constraint prevents duplicate accounts
    insert_result = (
        sb.table("nullifiers")
        .insert({
            "nullifier": nullifier_decimal,
            "action": settings.worldid_action,
            "user_id": user_id,
        })
        .execute()
    )

    # Check for unique violation (duplicate account)
    if hasattr(insert_result, "error") and insert_result.error:
        error_code = getattr(insert_result.error, "code", "")
        if error_code == "23505":
            raise HTTPException(status_code=409, detail="DUPLICATE_ACCOUNT")
        raise HTTPException(status_code=500, detail="Failed to store nullifier")

    # Mark profile as verified
    sb.table("profiles").update({"worldid_verified": True}).eq("id", user_id).execute()

    return {"success": True}
