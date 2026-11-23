// Espelho dos mappers de delivery do backend (PED-105): cotacao.mapper, pedido-delivery.mapper,
// entrega.mapper e taxa-entrega.mapper. Valores em reais, calculados pelo backend.
import type { FormaPagamento } from "./comanda";
import type { StatusItem, StatusPreparo } from "./pedido";

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
  // Taxa cobrada: 0 quando isenta (PED-126); null sem bairro atendido.
  taxa_entrega: number | null;
  // Taxa do bairro antes da isenção, para mostrar o que deixou de ser cobrado.
  taxa_entrega_bairro: number | null;
  taxa_isenta: boolean;
  origem_taxa: OrigemTaxa | null;
  tempo_estimado_min: number | null;
  desconto_aplicado: number;
  // Desconto maior que os itens: o total vem sem ele e a criação é recusada.
  desconto_excede_itens: boolean;
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
  // Taxa de entrega isenta pelo atendente (PED-126).
  taxa_isenta: boolean;
  forma_pagamento_prevista: FormaPagamento;
  troco: number;
  troco_suficiente: boolean;
  criado_em: string;
  previsao_entrega_em: string | null;
  atrasado: boolean;
  // Só dos itens que a cozinha prepara, como no KDS (PED-129).
  status_preparo: StatusPreparo;
  // false = só itens sem preparo: a entrega não aparece no KDS.
  passa_pela_cozinha: boolean;
  // Produtos ativos (sem os cancelados), para o card (PED-130).
  itens: ItemResumidoEntrega[];
}

export interface ItemResumidoEntrega {
  id: string;
  produto: string;
  quantidade: number;
  tem_observacao: boolean;
}

// GET /delivery/entregas/:id: tudo do pedido para o modal da expedição (PED-130).
export interface DetalheEntrega {
  id: string;
  numero_entrega: number;
  status_entrega: StatusEntrega;
  versao: number;
  cliente: { nome: string; telefone: string };
  endereco: {
    cep: string;
    logradouro: string;
    numero: string;
    complemento: string | null;
    bairro: string;
    cidade: string;
    uf: string;
    referencia: string | null;
  };
  itens: {
    id: string;
    produto: string;
    quantidade: number;
    preco_unitario: number;
    subtotal: number;
    observacao: string | null;
    status_item: StatusItem;
    precisa_preparo: boolean;
  }[];
  valores: {
    subtotal: number;
    desconto: number;
    taxa_entrega: number;
    taxa_isenta: boolean;
    total: number;
  };
  pagamento: {
    forma: FormaPagamento;
    troco_para: number | null;
    troco: number;
    troco_suficiente: boolean;
  };
  status_preparo: StatusPreparo;
  passa_pela_cozinha: boolean;
  criado_em: string;
  previsao_entrega_em: string | null;
  saiu_em: string | null;
  entregue_em: string | null;
  motivo_cancelamento: string | null;
  historico: {
    status_anterior: StatusEntrega | null;
    status_novo: StatusEntrega;
    motivo: string | null;
    // null = mudança automática (sincronização com a cozinha).
    usuario_nome: string | null;
    criado_em: string;
  }[];
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
