import type { LoginResponseSuperAdmin } from "./super-admin";

export type UserRole = "admin" | "garcom" | "cozinha" | "caixa" | "expedicao";

export interface AuthUser {
  id: string;
  nome: string;
  roles: UserRole[];
  tenant_id: string;
  pode_excluir_item_fechamento: boolean;
  pode_conceder_desconto: boolean;
}

export interface LoginResponseTenant {
  tipo: "tenant";
  token: string;
  usuario: AuthUser;
}

export type LoginResponse = LoginResponseTenant | LoginResponseSuperAdmin;
