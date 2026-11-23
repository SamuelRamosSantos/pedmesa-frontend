import type { UserRole } from "../types/auth";

// Seção "Delivery" do menu lateral (PED-112).

export type IconeMenuDelivery = "novo-pedido" | "expedicao" | "clientes";

export interface ItemMenuDelivery {
  label: string;
  route: string;
  icone: IconeMenuDelivery;
}

export const ITENS_MENU_DELIVERY: readonly ItemMenuDelivery[] = [
  { label: "Novo pedido", route: "/caixa/delivery/novo", icone: "novo-pedido" },
  { label: "Expedição", route: "/expedicao", icone: "expedicao" },
  { label: "Clientes", route: "/expedicao/clientes", icone: "clientes" },
];

// Quem atende o delivery (ADR-001); o backend confere de novo em cada rota.
const PAPEIS_DELIVERY: readonly UserRole[] = ["admin", "expedicao"];

// Itens visíveis: só para ADMIN e EXPEDICAO e só com o delivery ativo. `deliveryAtivo`
// null = configuração do tenant ainda carregando (não mostra nada até saber).
export function itensMenuDelivery(
  roles: readonly UserRole[],
  deliveryAtivo: boolean | null,
): readonly ItemMenuDelivery[] {
  const atende = roles.some((role) => PAPEIS_DELIVERY.includes(role));

  return atende && deliveryAtivo === true ? ITENS_MENU_DELIVERY : [];
}

// A visão "Expedição" sai de "Trocar visão": ela passa a ficar na seção Delivery, que
// some quando o delivery está desativado.
export function entraEmTrocarVisao(role: UserRole): boolean {
  return role !== "expedicao";
}
