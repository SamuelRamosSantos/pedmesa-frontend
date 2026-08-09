import type { UserRole } from "../types/auth";

export function getHomeRouteForRole(role: UserRole): string {
  switch (role) {
    case "garcom":
      return "/garcom/mesas";
    case "cozinha":
      return "/cozinha/kds";
    case "admin":
      return "/admin/dashboard";
    case "caixa":
      return "/caixa/mapa-mesas";
    default:
      return "/login";
  }
}

const PRIORIDADE_PAPEIS: UserRole[] = ["admin", "caixa", "garcom", "cozinha"];

export function getHomeRouteForRoles(roles: UserRole[]): string {
  if (roles.length === 0) {
    return "/login";
  }

  const papelPrioritario = PRIORIDADE_PAPEIS.find((role) => roles.includes(role));

  return getHomeRouteForRole(papelPrioritario ?? roles[0]);
}

export interface RoleViewInfo {
  role: UserRole;
  label: string;
  description: string;
  route: string;
}

export const ROLE_VIEW_INFO: Record<UserRole, RoleViewInfo> = {
  admin: {
    role: "admin",
    label: "Administração",
    description: "Dashboard, produtos, usuários e configurações do estabelecimento",
    route: "/admin/dashboard",
  },
  garcom: {
    role: "garcom",
    label: "Garçom",
    description: "Mesas, comandas e lançamento de pedidos",
    route: "/garcom/mesas",
  },
  cozinha: {
    role: "cozinha",
    label: "Cozinha",
    description: "Painel de preparo dos pedidos (KDS)",
    route: "/cozinha/kds",
  },
  caixa: {
    role: "caixa",
    label: "Caixa",
    description: "Mapa de mesas e fechamento de contas",
    route: "/caixa/mapa-mesas",
  },
};
