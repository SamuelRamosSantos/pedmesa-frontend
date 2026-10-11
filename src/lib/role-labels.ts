import type { UserRole } from "../types/auth";

// Nome curto de cada papel, usado no cadastro e na listagem de usuários. Único lugar a
// alterar quando um papel novo for criado (o Record obriga a cobrir todos).
export const ROLE_LABEL: Record<UserRole, string> = {
  admin: "Admin",
  garcom: "Garçom",
  cozinha: "Cozinha",
  caixa: "Caixa",
  expedicao: "Expedição",
};

// Ordem de exibição dos papéis nas telas de usuários.
export const ROLES_EM_ORDEM: UserRole[] = ["admin", "garcom", "cozinha", "caixa", "expedicao"];
