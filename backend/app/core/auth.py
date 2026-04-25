"""FastAPI dependency that extracts the current user from a Supabase JWT."""

from fastapi import HTTPException, Request

from app.core.supabase import get_supabase


async def get_current_user(request: Request) -> dict:
    """Validate the Authorization header and return the Supabase user dict."""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")

    token = auth_header.removeprefix("Bearer ")
    sb = get_supabase()
    try:
        user_response = sb.auth.get_user(token)
        if user_response is None or user_response.user is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return {"id": user_response.user.id, "email": user_response.user.email}
    except Exception as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc
