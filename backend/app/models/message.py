from pydantic import BaseModel


class MessageCreate(BaseModel):
    text: str


class MessageResponse(BaseModel):
    id: str
    text: str
    sender: str  # "me" or "them" — resolved relative to the requesting user
    timestamp: str
