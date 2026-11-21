import type { LoginResponse } from "../types/auth";
import { api } from "./api";

export interface LoginPayload {
  email: string;
  senha: string;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/login", payload);
  return data;
}
