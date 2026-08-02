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

export const REGRESSAO_ACAO: Partial<Record<StatusPreparo, ProximaAcao>> = {
  em_preparo: { label: "Voltar para Pendente", proximoStatus: "pendente" },
  pronto: { label: "Voltar para Em Preparo", proximoStatus: "em_preparo" },
};

export const STATUS_LABEL: Record<StatusPreparo, string> = {
  pendente: "Pendente",
  em_preparo: "Em Preparo",
  pronto: "Pronto",
  entregue: "Entregue",
};

export interface ColunaKanbanConfig {
  status: StatusPreparo;
  titulo: string;
}

export const COLUNAS_KANBAN: ColunaKanbanConfig[] = [
  { status: "pendente", titulo: "Pendente" },
  { status: "em_preparo", titulo: "Em Preparo" },
  { status: "pronto", titulo: "Pronto" },
];
