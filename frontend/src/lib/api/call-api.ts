import { apiRequest } from "./client";

export type CallInvite = {
  id: string;
  match_id: string;
  caller_id: string;
  callee_id: string;
  mode: "voice" | "video";
  status: "pending" | "accepted" | "declined" | "expired";
  created_at: string | null;
};

export async function createCallInvite(
  matchId: string,
  mode: "voice" | "video",
): Promise<CallInvite> {
  return apiRequest<CallInvite>("/api/calls/invite", {
    method: "POST",
    body: JSON.stringify({ match_id: matchId, mode }),
  });
}

export async function getPendingInvite(): Promise<CallInvite | null> {
  return apiRequest<CallInvite | null>("/api/calls/pending");
}

export async function respondToInvite(
  inviteId: string,
  action: "accept" | "decline",
): Promise<CallInvite> {
  return apiRequest<CallInvite>(`/api/calls/invite/${inviteId}`, {
    method: "PATCH",
    body: JSON.stringify({ action }),
  });
}

export async function checkInviteStatus(inviteId: string): Promise<CallInvite> {
  return apiRequest<CallInvite>(`/api/calls/invite/${inviteId}/status`);
}
