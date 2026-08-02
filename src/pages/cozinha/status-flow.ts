import type { StatusPreparo } from "../../types/pedido";

export interface ProximaAcao {
  label: string;
  proximoStatus: StatusPreparo;
}

export const PROXIMA_ACAO: Partial<Record<StatusPreparo, ProximaAcao>> = {
  pendente: { label: "Iniciar Preparo", proximoStatus: "em_preparo" },
  em_preparo: { label: "Marcar como Pronto", proximoStatus: "pronto" },
  pronto: { label: "Concluir / Entregar", proximoStatus: "entregue" },
};

export const STATUS_LABEL: Record<StatusPreparo, string> = {
  pendente: "Pendente",
  em_preparo: "Em Preparo",
  pronto: "Pronto",
  entregue: "Entregue",
};
