export type UserProfilePreferences = {
  interestedIn: string[];
  relationshipType: string;
  ageRange: [number, number];
  interests: string;
  relationshipMeaning: string;
  timeWithPartner: string;
  conflictStyle: string;
  islandScenario: string;
  musicalInstrument: string;
  sexuality: string;
  spendingHabits: string;
  hasDebt: string;
  wantsKids: string;
  photos: Array<{ url: string; caption: string }>;
};

export const PROFILE_STORAGE_KEY = 'blink.userProfilePreferences';

export const defaultUserProfilePreferences: UserProfilePreferences = {
  interestedIn: [],
  relationshipType: '',
  ageRange: [22, 35],
  interests: '',
  relationshipMeaning: '',
  timeWithPartner: '',
  conflictStyle: '',
  islandScenario: '',
  musicalInstrument: '',
  sexuality: '',
  spendingHabits: '',
  hasDebt: '',
  wantsKids: '',
  photos: [],
};

export function loadUserProfilePreferences(): UserProfilePreferences {
  const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
  if (!raw) {
    return defaultUserProfilePreferences;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<UserProfilePreferences>;
    return {
      ...defaultUserProfilePreferences,
      ...parsed,
      ageRange: Array.isArray(parsed.ageRange) && parsed.ageRange.length === 2
        ? [Number(parsed.ageRange[0]), Number(parsed.ageRange[1])]
        : defaultUserProfilePreferences.ageRange,
      photos: Array.isArray(parsed.photos) ? parsed.photos : [],
    };
  } catch {
    return defaultUserProfilePreferences;
  }
}

export function saveUserProfilePreferences(profile: UserProfilePreferences) {
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
}
