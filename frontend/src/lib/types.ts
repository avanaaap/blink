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
// Free-response fields (up to 150 characters each)
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
  bio: string;
  interests: string;
  relationship_meaning: string;
  time_with_partner: string;
  conflict_style: string;
  island_scenario?: IslandScenario;
  musical_instrument?: MusicalInstrument;
  spending_habits?: SpendingHabit;
  has_debt?: DebtStatus;
  wants_kids?: KidsPreference;
  profile_picture_url?: string;
  notifications_enabled: boolean;
  pause_matches: boolean;
  worldid_verified: boolean;
};

export type MatchDetail = {
  id: string;
  partner_name: string;
  partner_age?: number;
  partner_bio?: string;
  compatibility_score?: number;
  shared_interests: string[];
  status: MatchStatus;
  unlock_level: number;
};
