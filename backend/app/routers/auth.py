from fastapi import APIRouter, HTTPException

from app.core.supabase import get_supabase
from app.models.auth import AuthResponse, LoginRequest, SignupRequest

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/signup", response_model=AuthResponse)
async def signup(payload: SignupRequest):
    sb = get_supabase()

    # Create user in Supabase Auth
    try:
        auth_response = sb.auth.sign_up(
            {"email": payload.email, "password": payload.password}
        )
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    if auth_response.user is None:
        raise HTTPException(status_code=400, detail="Signup failed")

    user_id = auth_response.user.id

    # Create profile row
    sb.table("profiles").insert(
        {"id": user_id, "name": payload.name, "age": payload.age}
    ).execute()

    return AuthResponse(
        id=user_id,
        name=payload.name,
        email=payload.email,
        access_token=auth_response.session.access_token
        if auth_response.session
        else "",
    )


@router.post("/login", response_model=AuthResponse)
async def login(payload: LoginRequest):
    sb = get_supabase()

    try:
        auth_response = sb.auth.sign_in_with_password(
            {"email": payload.email, "password": payload.password}
        )
    except Exception as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc

    if auth_response.user is None:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    user_id = auth_response.user.id

    # Fetch the profile name
    profile = (
        sb.table("profiles").select("name").eq("id", user_id).single().execute()
    )

    return AuthResponse(
        id=user_id,
        name=profile.data.get("name", ""),
        email=payload.email,
        access_token=auth_response.session.access_token
        if auth_response.session
        else "",
    )
