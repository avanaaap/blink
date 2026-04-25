import type { Profile } from "../types";
import { apiRequest } from "./client";

export async function getMyProfile(): Promise<Profile> {
  return apiRequest<Profile>("/api/profiles/me");
}

export async function updateMyProfile(data: Partial<Profile>): Promise<Profile> {
  return apiRequest<Profile>("/api/profiles/me", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function getProfile(userId: string): Promise<Profile> {
  return apiRequest<Profile>(`/api/profiles/${userId}`);
}
