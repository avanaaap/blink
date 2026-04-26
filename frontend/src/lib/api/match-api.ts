import { hasApiBaseUrl } from "../config";
import type { MatchDetail } from "../types";
import { apiRequest } from "./client";

export type TodayMatchResult = {
  data: MatchDetail | null;
  source: "api" | "none";
};

export async function getTodayMatch(): Promise<TodayMatchResult> {
  if (!hasApiBaseUrl) {
    return { data: null, source: "none" };
  }

  try {
    const match = await apiRequest<MatchDetail | null>("/api/matches/today");
    if (!match) {
      return { data: null, source: "none" };
    }
    return { data: match, source: "api" };
  } catch {
    return { data: null, source: "none" };
  }
}

export async function getAllMatches(): Promise<MatchDetail[]> {
  if (!hasApiBaseUrl) return [];
  try {
    return await apiRequest<MatchDetail[]>("/api/matches/all");
  } catch {
    return [];
  }
}

export async function updateUnlockLevel(matchId: string, unlockLevel: number): Promise<MatchDetail> {
  return apiRequest<MatchDetail>(`/api/matches/${matchId}/unlock`, {
    method: "PATCH",
    body: JSON.stringify({ unlock_level: unlockLevel }),
  });
}

export type PartnerReveal = {
  name: string;
  age: number | null;
  bio: string;
  interests: string;
  compatibility_score: number | null;
  photos: Array<{ url: string; caption: string | null }>;
};

export async function getPartnerReveal(matchId: string): Promise<PartnerReveal> {
  return apiRequest<PartnerReveal>(`/api/matches/${matchId}/reveal`);
}

export async function declineMatch(matchId: string): Promise<void> {
  await apiRequest<{ detail: string }>(`/api/matches/${matchId}/decline`, {
    method: "POST",
  });
}
