export type ApiResult<T> = {
  data: T;
  source: "api" | "mock";
};

export type User = {
  id: string;
  name: string;
  email: string;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  access_token: string;
};

export type Message = {
  id: string;
  text: string;
  sender: "me" | "them";
  timestamp: string;
};

export type Profile = {
  id: string;
  name: string;
  age: number;
  sexuality?: string;
  interested_in: string[];
  relationship_type?: string;
  age_range_min: number;
  age_range_max: number;
  interests: string[];
  relationship_meaning: string[];
  time_with_partner: string[];
  conflict_style?: string;
  island_scenario?: string;
  musical_instrument?: string;
  spending_habits?: string;
  has_debt?: string;
  wants_kids?: string;
  notifications_enabled: boolean;
  pause_matches: boolean;
  worldid_verified: boolean;
};

export type MatchDetail = {
  id: string;
  partner_name: string;
  partner_age?: number;
  compatibility_score?: number;
  shared_interests: string[];
  status: string;
  unlock_level: number;
};
