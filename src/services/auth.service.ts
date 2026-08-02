import { api } from "./api";
import type { LoginResponse } from "../types/auth";

export interface LoginPayload {
  email: string;
  senha: string;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/login", payload);
  return data;
}
