import { matchProfile } from "../mock-data";
import { hasApiBaseUrl } from "../config";
import type { ApiResult, MatchDetail } from "../types";
import { apiRequest } from "./client";

export async function getTodayMatch(): Promise<ApiResult<typeof matchProfile>> {
  if (!hasApiBaseUrl) {
    return { data: matchProfile, source: "mock" };
  }

  try {
    const match = await apiRequest<MatchDetail | null>("/api/matches/today");
    if (!match) {
      return { data: matchProfile, source: "mock" };
    }
    // Map API response to the shape the frontend expects
    const data = {
      ...matchProfile,
      name: match.partner_name,
      age: match.partner_age ?? matchProfile.age,
      compatibilityScore: match.compatibility_score ?? matchProfile.compatibilityScore,
      interests: match.shared_interests.length > 0 ? match.shared_interests : matchProfile.interests,
    };
    return { data, source: "api" };
  } catch {
    return { data: matchProfile, source: "mock" };
  }
}

export async function updateUnlockLevel(matchId: string, unlockLevel: number): Promise<MatchDetail> {
  return apiRequest<MatchDetail>(`/api/matches/${matchId}/unlock`, {
    method: "PATCH",
    body: JSON.stringify({ unlock_level: unlockLevel }),
  });
}
