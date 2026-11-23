import type { StatusItem } from "../types/pedido";
import type { Tom } from "./tons";

export const STATUS_ITEM_LABEL: Record<StatusItem, string> = {
  pendente: "Pendente",
  em_preparo: "Em Preparo",
  pronto: "Pronto",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

// Guia visual (PED-132): pendente aguarda (aviso), em preparo anda, pronto é sucesso.
// O vermelho fica só para erro e atraso.
export const TOM_STATUS_ITEM: Record<StatusItem, Tom> = {
  pendente: "aviso",
  em_preparo: "andamento",
  pronto: "sucesso",
  entregue: "neutro",
  cancelado: "neutro",
};

export function statusItemLabelPlural(
  status: StatusItem,
  count: number,
): string {
  if (status === "em_preparo" || count === 1) {
    return STATUS_ITEM_LABEL[status];
  }

  return `${STATUS_ITEM_LABEL[status]}s`;
}
