import type { AuthUser } from "../types/auth";

const USER_KEY = "pedmesa:user";

// PED-76: o token de autenticação não fica mais acessível a JS (mora num cookie
// HttpOnly setado pelo backend) — o que sobra aqui é só o objeto do usuário, usado
// pela UI (nome, papéis, etc.), nunca o valor do token em si.
export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setStoredUser(user: AuthUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredUser(): void {
  localStorage.removeItem(USER_KEY);
}
