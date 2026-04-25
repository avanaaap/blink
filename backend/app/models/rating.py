from pydantic import BaseModel, Field


class RatingCreate(BaseModel):
    interaction_id: str
    rating: int = Field(ge=1, le=5)
    feedback: str | None = None


class RatingResponse(BaseModel):
    id: str
    interaction_id: str
    rater_id: str
    rating: int
    feedback: str | None = None
    created_at: str | None = None
