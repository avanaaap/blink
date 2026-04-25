from pydantic import BaseModel, Field

from app.models.enums import (
    ConflictStyle,
    DebtStatus,
    GenderOption,
    InterestOption,
    IslandScenario,
    KidsPreference,
    MusicalInstrument,
    RelationshipType,
    RelationshipValue,
    SexualityOption,
    SpendingHabit,
    TimeWithPartner,
)


class ProfileCreate(BaseModel):
    name: str
    age: int = Field(ge=18)


class ProfileUpdate(BaseModel):
    name: str | None = None
    age: int | None = Field(default=None, ge=18)
    sexuality: SexualityOption | None = None
    interested_in: list[GenderOption] | None = None
    relationship_type: RelationshipType | None = None
    age_range_min: int | None = None
    age_range_max: int | None = None
    interests: list[InterestOption] | None = None
    relationship_meaning: list[RelationshipValue] | None = None
    time_with_partner: list[TimeWithPartner] | None = None
    conflict_style: ConflictStyle | None = None
    island_scenario: IslandScenario | None = None
    musical_instrument: MusicalInstrument | None = None
    spending_habits: SpendingHabit | None = None
    has_debt: DebtStatus | None = None
    wants_kids: KidsPreference | None = None
    notifications_enabled: bool | None = None
    pause_matches: bool | None = None


class ProfileResponse(BaseModel):
    id: str
    name: str
    age: int
    sexuality: SexualityOption | None = None
    interested_in: list[GenderOption] = []
    relationship_type: RelationshipType | None = None
    age_range_min: int = 18
    age_range_max: int = 80
    interests: list[InterestOption] = []
    relationship_meaning: list[RelationshipValue] = []
    time_with_partner: list[TimeWithPartner] = []
    conflict_style: ConflictStyle | None = None
    island_scenario: IslandScenario | None = None
    musical_instrument: MusicalInstrument | None = None
    spending_habits: SpendingHabit | None = None
    has_debt: DebtStatus | None = None
    wants_kids: KidsPreference | None = None
    notifications_enabled: bool = True
    pause_matches: bool = False
    worldid_verified: bool = False
    created_at: str | None = None
    updated_at: str | None = None
