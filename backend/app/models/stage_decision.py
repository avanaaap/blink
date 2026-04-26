from pydantic import BaseModel

from app.models.enums import StageDecision


class StageDecisionCreate(BaseModel):
    match_id: str
    decision: StageDecision


class StageDecisionResponse(BaseModel):
    status: str  # "waiting", "advanced", or "unmatched"
    unlock_level: int
