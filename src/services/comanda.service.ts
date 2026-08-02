import { api } from "./api";
import type { ComandaDetail, ComandaListItem } from "../types/comanda";

export interface CreateComandaPayload {
  numero_comanda: number;
  integrantes: { nome: string }[];
}

export async function listComandas(): Promise<ComandaListItem[]> {
  const { data } = await api.get<ComandaListItem[]>("/comandas");
  return data;
}

export async function createComanda(payload: CreateComandaPayload): Promise<ComandaDetail> {
  const { data } = await api.post<ComandaDetail>("/comandas", payload);
  return data;
}
