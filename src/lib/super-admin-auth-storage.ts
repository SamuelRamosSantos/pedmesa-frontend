import type { SuperAdminUser } from "../types/super-admin";

const USER_KEY = "pedmesa:admin:user";

// PED-76: mesma lógica de auth-storage.ts — o token vive só no cookie HttpOnly,
// aqui fica só o objeto do super-admin pra UI renderizar (nome, e-mail).
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

export function setStoredSuperAdminUser(user: SuperAdminUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredSuperAdminUser(): void {
  localStorage.removeItem(USER_KEY);
}
