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

export interface ExtratoIntegranteResumo {
  integrante_id: string;
  nome: string;
}

export interface ComandaExtratoResumo {
  comanda_id: string;
  numero_comanda: number;
  status: ComandaStatus;
  divisao_por_integrante: ExtratoIntegranteResumo[];
}
