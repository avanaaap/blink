import { matchProfile } from "../mock-data";
import { hasApiBaseUrl } from "../config";
import type { ApiResult } from "../types";
import { apiRequest } from "./client";

export async function getTodayMatch(): Promise<ApiResult<typeof matchProfile>> {
  if (!hasApiBaseUrl) {
    return { data: matchProfile, source: "mock" };
  }

  try {
    const data = await apiRequest<typeof matchProfile>("/matches/today");
    return { data, source: "api" };
  } catch {
    return { data: matchProfile, source: "mock" };
  }
}
