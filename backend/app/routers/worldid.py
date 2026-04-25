"""
World ID off-chain verification placeholder.

When ready to implement:
1. Accept the proof payload from the frontend (IDKit onSuccess callback).
2. POST it to the World ID Developer Portal verification endpoint.
3. Return success/failure to the client.

Docs: https://docs.world.org/world-id
"""

from fastapi import APIRouter

router = APIRouter(prefix="/api/worldid", tags=["worldid"])


@router.post("/verify")
async def verify_worldid() -> dict[str, str]:
    # TODO: implement off-chain verification
    return {"status": "not_implemented"}
