import type { AuthUser, User } from "../types";
import { apiRequest, setAccessToken } from "./client";

type LoginPayload = {
  email: string;
  password: string;
};

type SignupPayload = {
  name: string;
  email: string;
  password: string;
  age: number;
};

export async function login(payload: LoginPayload): Promise<User> {
  const result = await apiRequest<AuthUser>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  setAccessToken(result.access_token);
  return { id: result.id, name: result.name, email: result.email };
}

export async function signup(payload: SignupPayload): Promise<User> {
  const result = await apiRequest<AuthUser>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  setAccessToken(result.access_token);
  return { id: result.id, name: result.name, email: result.email };
}
