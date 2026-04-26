import { apiRequest } from "./client";

export type StageDecisionChoice = "move_forward" | "not_sure" | "dont_move_forward";

export type StageDecisionResponse = {
  status: "waiting" | "advanced" | "unmatched";
  unlock_level: number;
};

export async function submitStageDecision(
  matchId: string,
  decision: StageDecisionChoice,
): Promise<StageDecisionResponse> {
  return apiRequest<StageDecisionResponse>("/api/matching/decide", {
    method: "POST",
    body: JSON.stringify({ match_id: matchId, decision }),
  });
}
