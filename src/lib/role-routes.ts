import type { UserRole } from "../types/auth";

export function getHomeRouteForRole(role: UserRole): string {
  switch (role) {
    case "garcom":
      return "/garcom/mesas";
    case "cozinha":
      return "/cozinha/kds";
    case "admin":
    case "caixa":
      return "/caixa/mapa-mesas";
    default:
      return "/login";
  }
}
