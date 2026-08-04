import type { StatusItem } from "../../types/pedido";

export interface ProximaAcao {
  label: string;
  proximoStatus: StatusItem;
}

// A cozinha avança até "pronto" e para por aí — quem marca como entregue é sempre o garçom.
export const PROXIMA_ACAO_ITEM: Partial<Record<StatusItem, ProximaAcao>> = {
  pendente: { label: "Iniciar Preparo", proximoStatus: "em_preparo" },
  em_preparo: { label: "Marcar como Pronto", proximoStatus: "pronto" },
};

export const REGRESSAO_ACAO_ITEM: Partial<Record<StatusItem, ProximaAcao>> = {
  em_preparo: { label: "Voltar para Pendente", proximoStatus: "pendente" },
  pronto: { label: "Voltar para Em Preparo", proximoStatus: "em_preparo" },
};

export interface ColunaKanbanConfig {
  status: StatusItem;
  titulo: string;
}

export const COLUNAS_KANBAN: ColunaKanbanConfig[] = [
  { status: "pendente", titulo: "Pendente" },
  { status: "em_preparo", titulo: "Em Preparo" },
  { status: "pronto", titulo: "Pronto" },
];
