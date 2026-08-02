import type { StatusItem } from "../../types/pedido";

export const STATUS_ITEM_LABEL: Record<StatusItem, string> = {
  pendente: "Pendente",
  em_preparo: "Em Preparo",
  pronto: "Pronto",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

export const STATUS_ITEM_BADGE_CLASS: Record<StatusItem, string> = {
  pendente: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300",
  em_preparo: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  pronto: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  entregue: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  cancelado: "bg-slate-200 text-slate-500 line-through dark:bg-slate-800 dark:text-slate-500",
};
