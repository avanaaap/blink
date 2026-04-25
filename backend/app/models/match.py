from pydantic import BaseModel, Field

from app.models.enums import InterestOption, MatchStatus


class MatchResponse(BaseModel):
    id: str
    user_a: str
    user_b: str
    compatibility_score: int | None = None
    shared_interests: list[InterestOption] = []
    match_date: str
    status: MatchStatus = MatchStatus.PENDING
    unlock_level: int = 0
    created_at: str | None = None


class MatchDetail(BaseModel):
    """Match with partner profile info for the frontend."""

    id: str
    partner_name: str
    partner_age: int | None = None
    compatibility_score: int | None = None
    shared_interests: list[InterestOption] = []
    status: MatchStatus = MatchStatus.PENDING
    unlock_level: int = 0


class UnlockUpdate(BaseModel):
    unlock_level: int = Field(ge=0, le=4)
