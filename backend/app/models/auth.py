from pydantic import BaseModel


class AuthResponse(BaseModel):
    user_id: str
    access_token: str
    is_new_user: bool
