import type { MatchDetail } from "../types";
import { apiRequest } from "./client";

export async function getTodayMatch(): Promise<MatchDetail | null> {
  return apiRequest<MatchDetail | null>("/api/matches/today");
}

export async function updateUnlockLevel(matchId: string, unlockLevel: number): Promise<MatchDetail> {
  return apiRequest<MatchDetail>(`/api/matches/${matchId}/unlock`, {
    method: "PATCH",
    body: JSON.stringify({ unlock_level: unlockLevel }),
  });
}
