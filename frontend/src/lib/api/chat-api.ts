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
