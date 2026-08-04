import type { StatusItem } from "../../types/pedido";

export { STATUS_ITEM_LABEL, STATUS_ITEM_BADGE_CLASS, statusItemLabelPlural } from "../../lib/status-item";

export type FiltroStatusPedido = "todos" | "em_producao" | "pronto";

export const FILTROS_STATUS_PEDIDO: { value: FiltroStatusPedido; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "em_producao", label: "Em Produção" },
  { value: "pronto", label: "Aguardando Entrega" },
];

export function statusItemPassaFiltro(status: StatusItem, filtro: FiltroStatusPedido): boolean {
  if (filtro === "todos") {
    return true;
  }

  if (filtro === "pronto") {
    return status === "pronto";
  }

  return status === "pendente" || status === "em_preparo";
}
