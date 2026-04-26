from pydantic import BaseModel, Field

from app.models.enums import (
    DebtStatus,
    GenderIdentity,
    GenderOption,
    IslandScenario,
    KidsPreference,
    MusicalInstrument,
    RelationshipType,
    SexualityOption,
    SpendingHabit,
)


class ProfileCreate(BaseModel):
    name: str
    age: int = Field(ge=18)


class ProfileUpdate(BaseModel):
    name: str | None = None
    age: int | None = Field(default=None, ge=18)
    gender: GenderIdentity | None = None
    sexuality: SexualityOption | None = None
    interested_in: list[GenderOption] | None = None
    relationship_type: RelationshipType | None = None
    age_range_min: int | None = None
    age_range_max: int | None = None
    interests: str | None = Field(default=None, max_length=150)
    relationship_meaning: str | None = Field(default=None, max_length=150)
    time_with_partner: str | None = Field(default=None, max_length=150)
    conflict_style: str | None = Field(default=None, max_length=150)
    island_scenario: IslandScenario | None = None
    musical_instrument: MusicalInstrument | None = None
    spending_habits: SpendingHabit | None = None
    has_debt: DebtStatus | None = None
    wants_kids: KidsPreference | None = None
    profile_picture_url: str | None = None
    notifications_enabled: bool | None = None
    pause_matches: bool | None = None


class ProfileResponse(BaseModel):
    id: str
    name: str
    age: int
    gender: GenderIdentity | None = None
    sexuality: SexualityOption | None = None
    interested_in: list[GenderOption] = []
    relationship_type: RelationshipType | None = None
    age_range_min: int = 18
    age_range_max: int = 80
    interests: str = ""
    relationship_meaning: str = ""
    time_with_partner: str = ""
    conflict_style: str = ""
    island_scenario: IslandScenario | None = None
    musical_instrument: MusicalInstrument | None = None
    spending_habits: SpendingHabit | None = None
    has_debt: DebtStatus | None = None
    wants_kids: KidsPreference | None = None
    profile_picture_url: str | None = None
    notifications_enabled: bool = True
    pause_matches: bool = False
    worldid_verified: bool = False
    created_at: str | None = None
    updated_at: str | None = None
