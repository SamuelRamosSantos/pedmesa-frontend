// Espelho dos mappers de delivery do backend (PED-105): cotacao.mapper, pedido-delivery.mapper,
// entrega.mapper e taxa-entrega.mapper. Valores em reais, calculados pelo backend.
import type { FormaPagamento } from "./comanda";
import type { StatusPreparo } from "./pedido";

export type StatusEntrega =
  | "em_producao"
  | "pronto_para_envio"
  | "em_rota"
  | "entregue"
  | "cancelado";

// De onde veio a taxa da cotação: tabela por bairro ou taxa padrão do estabelecimento.
export type OrigemTaxa = "bairro" | "padrao";

export interface CotacaoDelivery {
  atendido: boolean;
  motivo_nao_atendido: string | null;
  subtotal: number;
  taxa_entrega: number | null;
  origem_taxa: OrigemTaxa | null;
  tempo_estimado_min: number | null;
  total: number;
  pedido_minimo: number;
  pedido_minimo_atingido: boolean;
  troco: number;
  troco_suficiente: boolean;
}

export interface PedidoDeliveryCriado {
  entrega_id: string;
  comanda_id: string;
  numero_entrega: number;
  status_entrega: StatusEntrega;
  subtotal: number;
  taxa_entrega: number;
  total: number;
  troco: number;
  previsao_entrega_em: string | null;
}

// Card do painel de expedição (GET /delivery/entregas).
export interface EntregaPainel {
  id: string;
  numero_entrega: number;
  status_entrega: StatusEntrega;
  // Enviar de volta na transição (optimistic locking).
  versao: number;
  cliente: { nome: string; telefone: string };
  bairro: string;
  endereco_resumido: string;
  total: number;
  forma_pagamento_prevista: FormaPagamento;
  troco: number;
  troco_suficiente: boolean;
  criado_em: string;
  previsao_entrega_em: string | null;
  atrasado: boolean;
  status_preparo: StatusPreparo;
}

// Resposta da transição de status e campo `entrega` do 409 de concorrência.
export interface EntregaEstado {
  id: string;
  numero_entrega: number;
  status_entrega: StatusEntrega;
  versao: number;
  previsao_entrega_em: string | null;
  saiu_em: string | null;
  entregue_em: string | null;
  motivo_cancelamento: string | null;
}

// Corpo do 409: outra pessoa mudou a entrega; `entrega` traz o estado atual.
export interface ConflitoEntregaResponse {
  message: string;
  entrega: EntregaEstado;
}

export interface TaxaEntrega {
  id: string;
  cidade: string;
  bairro: string;
  valor: number;
  tempo_estimado_min: number | null;
  ativo: boolean;
}
