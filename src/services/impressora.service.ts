import { api } from "./api";
import type { Impressora } from "../types/impressora";

export interface CreateImpressoraPayload {
  nome: string;
  ip: string;
  porta?: number;
}

export interface UpdateImpressoraPayload {
  nome?: string;
  ip?: string;
  porta?: number;
  ativo?: boolean;
}

export async function listImpressoras(): Promise<Impressora[]> {
  const { data } = await api.get<Impressora[]>("/impressao/impressoras");
  return data;
}

export async function createImpressora(payload: CreateImpressoraPayload): Promise<Impressora> {
  const { data } = await api.post<Impressora>("/impressao/impressoras", payload);
  return data;
}

export async function updateImpressora(id: string, payload: UpdateImpressoraPayload): Promise<Impressora> {
  const { data } = await api.patch<Impressora>(`/impressao/impressoras/${id}`, payload);
  return data;
}

export async function deleteImpressora(id: string): Promise<void> {
  await api.delete(`/impressao/impressoras/${id}`);
}
