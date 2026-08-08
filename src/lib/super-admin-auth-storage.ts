import type { SuperAdminUser } from "../types/super-admin";

const TOKEN_KEY = "pedmesa:admin:token";
const USER_KEY = "pedmesa:admin:user";

export function getStoredSuperAdminToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredSuperAdminUser(): SuperAdminUser | null {
  const raw = localStorage.getItem(USER_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as SuperAdminUser;
  } catch {
    return null;
  }
}

export function setStoredSuperAdminAuth(token: string, user: SuperAdminUser): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredSuperAdminAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
