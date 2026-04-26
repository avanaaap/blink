export type ApiResult<T> = {
  data: T;
  source: "api" | "mock";
};

export type User = {
  id: string;
  name: string;
};

export type AuthUser = {
  user_id: string;
  access_token: string;
  is_new_user: boolean;
};

export type Message = {
  id: string;
  text: string;
  sender: "me" | "them";
  timestamp: string;
};

// Enum-aligned string literal types
export type GenderIdentity = "Man" | "Woman" | "Non-binary" | "Prefer not to say";
export type GenderOption = "Women" | "Men" | "Non-binary";
export type RelationshipType = "Monogamy" | "Polyamory" | "Open to Either";
export type InterestOption =
  | "Travel" | "Music" | "Art" | "Sports" | "Cooking" | "Reading"
  | "Technology" | "Fitness" | "Movies" | "Photography" | "Gaming" | "Nature";
export type RelationshipValue =
  | "Emotional support" | "Quality time" | "Trust & connection"
  | "Shared experiences" | "Commitment" | "Physical affection";
export type TimeWithPartner =
  | "Mostly together" | "Balanced" | "Need personal space" | "Depends on the relationship";
export type ConflictStyle =
  | "Talk it out right away" | "Take space, then come back to it" | "Avoid it / keep the peace";
export type IslandScenario =
  | "Cry" | "Explore the island for resources" | "Try to signal for help" | "Stay calm and make a plan";
export type MusicalInstrument = "Guitar" | "Piccolo" | "Tuba" | "Saxophone" | "Flute" | "Clarinet";
export type SexualityOption =
  | "Straight" | "Gay" | "Lesbian" | "Bisexual" | "Pansexual" | "Asexual" | "Prefer not to say";
export type SpendingHabit = "Frugal / Saver" | "Balanced" | "Enjoy spending" | "Live in the moment";
export type DebtStatus = "No debt" | "Student loans" | "Credit card debt" | "Prefer not to say";
export type KidsPreference = "Yes" | "No" | "Maybe / Open to it" | "Already have kids";
export type MatchStatus = "active" | "completed" | "expired" | "declined";

export type Profile = {
  id: string;
  name: string;
  age: number;
  gender?: GenderIdentity;
  sexuality?: SexualityOption;
  interested_in: GenderOption[];
  relationship_type?: RelationshipType;
  age_range_min: number;
  age_range_max: number;
  interests: InterestOption[];
  relationship_meaning: RelationshipValue[];
  time_with_partner: TimeWithPartner[];
  conflict_style?: ConflictStyle;
  island_scenario?: IslandScenario;
  musical_instrument?: MusicalInstrument;
  spending_habits?: SpendingHabit;
  has_debt?: DebtStatus;
  wants_kids?: KidsPreference;
  notifications_enabled: boolean;
  pause_matches: boolean;
  worldid_verified: boolean;
};

export type MatchDetail = {
  id: string;
  partner_name: string;
  partner_age?: number;
  compatibility_score?: number;
  shared_interests: InterestOption[];
  status: MatchStatus;
  unlock_level: number;
};
