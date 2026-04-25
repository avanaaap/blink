"""
World ID authentication routes.

1. POST /api/worldid/rp-signature  — generate a signed RP request for IDKit
2. POST /api/worldid/verify        — verify proof, create/find user, return JWT
"""

import uuid

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.core.auth import create_access_token
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


class VerifyRequest(BaseModel):
    idkit_response: dict


class AuthResponse(BaseModel):
    user_id: str
    access_token: str
    is_new_user: bool


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


@router.post("/verify", response_model=AuthResponse)
async def verify_and_authenticate(payload: VerifyRequest):
    """Verify World ID proof, upsert user, and return a JWT."""
    if not settings.worldid_rp_id:
        raise HTTPException(status_code=500, detail="World ID RP ID not configured")

    idkit_response = payload.idkit_response

    # Ensure action is included — required by World ID for uniqueness proofs
    if "action" not in idkit_response:
        idkit_response["action"] = settings.worldid_action

    # 1. Verify proof with World ID
    async with httpx.AsyncClient() as client:
        world_res = await client.post(
            f"https://developer.world.org/api/v4/verify/{settings.worldid_rp_id}",
            json=idkit_response,
            headers={"Content-Type": "application/json"},
        )

    if not world_res.is_success:
        try:
            error_body = world_res.json()
        except Exception:
            error_body = world_res.text
        raise HTTPException(
            status_code=400,
            detail={"message": "World ID verification failed", "world_id_error": error_body},
        )

    # 2. Extract nullifier
    responses = idkit_response.get("responses", [])
    if not responses:
        raise HTTPException(status_code=400, detail="No proof responses found")

    nullifier_raw = responses[0].get("nullifier", "")
    nullifier_decimal = (
        str(int(nullifier_raw, 16)) if nullifier_raw.startswith("0x") else nullifier_raw
    )

    sb = get_supabase()

    # 3. Check if this nullifier already has an account
    existing = (
        sb.table("nullifiers")
        .select("user_id")
        .eq("nullifier", nullifier_decimal)
        .eq("action", settings.worldid_action)
        .execute()
    )

    if existing.data:
        # Returning user — issue JWT
        user_id = existing.data[0]["user_id"]
        token = create_access_token(user_id)
        return AuthResponse(user_id=user_id, access_token=token, is_new_user=False)

    # 4. New user — create profile + nullifier
    user_id = str(uuid.uuid4())

    sb.table("profiles").insert({
        "id": user_id,
        "name": "",
        "age": 18,
        "worldid_verified": True,
    }).execute()

    sb.table("nullifiers").insert({
        "nullifier": nullifier_decimal,
        "action": settings.worldid_action,
        "user_id": user_id,
    }).execute()

    token = create_access_token(user_id)
    return AuthResponse(user_id=user_id, access_token=token, is_new_user=True)
