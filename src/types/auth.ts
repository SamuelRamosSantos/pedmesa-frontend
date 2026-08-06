export type UserRole = "admin" | "garcom" | "cozinha" | "caixa";

export interface AuthUser {
  id: string;
  nome: string;
  roles: UserRole[];
  tenant_id: string;
  pode_excluir_item_fechamento: boolean;
  pode_conceder_desconto: boolean;
}

export interface LoginResponse {
  token: string;
  usuario: AuthUser;
}
