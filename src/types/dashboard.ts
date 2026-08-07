import type { FormaPagamento } from "./comanda";

export type PeriodoDashboard = "hoje" | "7_dias" | "30_dias" | "customizado";

export interface ProdutoMaisPedido {
  produto_nome: string;
  quantidade: number;
}

export interface HistoricoComandaLinha {
  comanda_id: string;
  fechada_em: string;
  mesa: number;
  valor: number;
  formas_pagamento: FormaPagamento[];
}

export interface DashboardResumo {
  periodo: PeriodoDashboard;
  faturamento: number;
  comandas_fechadas: number;
  ticket_medio: number;
  produtos_mais_pedidos: ProdutoMaisPedido[];
  historico_comandas: HistoricoComandaLinha[];
}
