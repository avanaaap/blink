import type { User } from "../types";
import { apiRequest } from "./client";

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
  return apiRequest<User>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function signup(payload: SignupPayload): Promise<User> {
  return apiRequest<User>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
