import type { Message } from "../types";
import { apiRequest } from "./client";

export async function getConversation(matchId: string): Promise<Message[]> {
  return apiRequest<Message[]>(`/api/matches/${matchId}/messages`);
}

export async function sendConversationMessage(matchId: string, text: string): Promise<Message> {
  return apiRequest<Message>(`/api/matches/${matchId}/messages`, {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

export async function sendTypingSignal(matchId: string): Promise<void> {
  await apiRequest<{ ok: boolean }>(`/api/matches/${matchId}/typing`, {
    method: "POST",
  });
}

export async function getTypingStatus(matchId: string): Promise<boolean> {
  try {
    const res = await apiRequest<{ is_typing: boolean }>(`/api/matches/${matchId}/typing`);
    return res.is_typing;
  } catch {
    return false;
  }
}
