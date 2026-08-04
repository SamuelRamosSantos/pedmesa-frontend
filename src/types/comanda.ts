import type { StatusItem } from "./pedido";

export type ComandaStatus = "aberta" | "fechada";

export interface Integrante {
  id: string;
  nome: string;
}

export interface ComandaListItem {
  id: string;
  numero_comanda: number;
  status: ComandaStatus;
  total_integrantes: number;
  aberta_em: string;
}

export interface ComandaDetail {
  id: string;
  numero_comanda: number;
  status: ComandaStatus;
  aberta_em: string;
  integrantes: Integrante[];
}

export interface ExtratoItemLinha {
  produto: string;
  qtd: number;
  preco_unitario: number;
  subtotal: number;
}

export interface ExtratoIntegranteResumo {
  integrante_id: string;
  nome: string;
  itens_individuais: ExtratoItemLinha[];
  total_individual: number;
  cota_compartilhada: number;
  total_a_pagar: number;
}

export interface ResumoFinanceiro {
  total_itens_individuais: number;
  total_itens_compartilhados: number;
  quantidade_integrantes: number;
  valor_compartilhado_por_pessoa: number;
  valor_total_comanda: number;
}

export interface ItemPendenteEntrega {
  produto_nome: string;
  quantidade: number;
  status_item: StatusItem;
}

export interface ComandaExtratoResumo {
  comanda_id: string;
  numero_comanda: number;
  status: ComandaStatus;
  resumo_financeiro: ResumoFinanceiro;
  divisao_por_integrante: ExtratoIntegranteResumo[];
  itens_pendentes_entrega: number;
  possui_itens_pendentes: boolean;
  itens_pendentes: ItemPendenteEntrega[];
}
