import { apiRequest } from "./client";

export type AgoraTokenResponse = {
  token: string;
  channel: string;
  uid: number;
  app_id: string;
  interaction_id: string | null;
};

export async function getAgoraToken(
  matchId: string,
  mode: "voice" | "video",
): Promise<AgoraTokenResponse> {
  return apiRequest<AgoraTokenResponse>("/api/agora/token", {
    method: "POST",
    body: JSON.stringify({ match_id: matchId, mode }),
  });
}
