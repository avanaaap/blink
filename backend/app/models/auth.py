from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    age: int = Field(ge=18)


class AuthResponse(BaseModel):
    id: str
    name: str
    email: str
    access_token: str
