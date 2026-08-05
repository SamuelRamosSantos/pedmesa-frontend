export type UserRole = "admin" | "garcom" | "cozinha" | "caixa";

export interface AuthUser {
  id: string;
  nome: string;
  roles: UserRole[];
  tenant_id: string;
}

export interface LoginResponse {
  token: string;
  usuario: AuthUser;
}
