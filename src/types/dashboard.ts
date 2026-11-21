import type { FormaPagamento, TipoAtendimento } from "./comanda";

export type PeriodoDashboard = "hoje" | "7_dias" | "30_dias" | "customizado";

export interface ProdutoMaisPedido {
  produto_nome: string;
  quantidade: number;
}

export interface HistoricoComandaLinha {
  comanda_id: string;
  fechada_em: string;
  tipo_atendimento: TipoAtendimento;
  // Montado pelo backend: "Mesa 12" ou "Delivery #7".
  identificador: string;
  valor: number;
  formas_pagamento: FormaPagamento[];
}

export interface DashboardResumo {
  periodo: PeriodoDashboard;
  // Inclui delivery (com as taxas de entrega).
  faturamento: number;
  taxas_entrega: number;
  comandas_fechadas: number;
  ticket_medio: number;
  produtos_mais_pedidos: ProdutoMaisPedido[];
  historico_comandas: HistoricoComandaLinha[];
}
