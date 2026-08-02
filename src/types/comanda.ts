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
