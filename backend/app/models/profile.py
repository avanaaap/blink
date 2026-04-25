from pydantic import BaseModel, Field


class ProfileCreate(BaseModel):
    name: str
    age: int = Field(ge=18)


class ProfileUpdate(BaseModel):
    name: str | None = None
    age: int | None = Field(default=None, ge=18)
    sexuality: str | None = None
    interested_in: list[str] | None = None
    relationship_type: str | None = None
    age_range_min: int | None = None
    age_range_max: int | None = None
    interests: list[str] | None = None
    relationship_meaning: list[str] | None = None
    time_with_partner: list[str] | None = None
    conflict_style: str | None = None
    island_scenario: str | None = None
    musical_instrument: str | None = None
    spending_habits: str | None = None
    has_debt: str | None = None
    wants_kids: str | None = None
    notifications_enabled: bool | None = None
    pause_matches: bool | None = None


class ProfileResponse(BaseModel):
    id: str
    name: str
    age: int
    sexuality: str | None = None
    interested_in: list[str] = []
    relationship_type: str | None = None
    age_range_min: int = 18
    age_range_max: int = 80
    interests: list[str] = []
    relationship_meaning: list[str] = []
    time_with_partner: list[str] = []
    conflict_style: str | None = None
    island_scenario: str | None = None
    musical_instrument: str | None = None
    spending_habits: str | None = None
    has_debt: str | None = None
    wants_kids: str | None = None
    notifications_enabled: bool = True
    pause_matches: bool = False
    worldid_verified: bool = False
    created_at: str | None = None
    updated_at: str | None = None
