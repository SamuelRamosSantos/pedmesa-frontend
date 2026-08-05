import type { UserRole } from "./auth";

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  roles: UserRole[];
  pode_excluir_item_fechamento: boolean;
  ativo: boolean;
  criado_em: string;
}
