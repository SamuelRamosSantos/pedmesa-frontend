import { api } from "./api";
import type { ComandaDetail, ComandaExtratoResumo, ComandaListItem, ComandaStatus, Integrante } from "../types/comanda";

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

export async function getComandaExtrato(comandaId: string): Promise<ComandaExtratoResumo> {
  const { data } = await api.get<ComandaExtratoResumo>(`/comandas/${comandaId}/extrato`);
  return data;
}

export async function addIntegrante(comandaId: string, nome: string): Promise<Integrante> {
  const { data } = await api.post<Integrante>(`/comandas/${comandaId}/integrantes`, { nome });
  return data;
}

export interface JoinComandasPayload {
  comanda_principal_id: string;
  comandas_secundarias_ids: string[];
}

export interface JoinComandasResponse {
  mensagem: string;
  comanda_principal_id: string;
}

export async function joinComandas(payload: JoinComandasPayload): Promise<JoinComandasResponse> {
  const { data } = await api.post<JoinComandasResponse>("/comandas/juntar", payload);
  return data;
}

export type FormaPagamento = "pix" | "dinheiro" | "cartao_credito" | "cartao_debito";

export interface PagamentoPayload {
  forma: FormaPagamento;
  valor: number;
}

export interface FecharComandaPayload {
  pagamentos: PagamentoPayload[];
}

export interface FecharComandaResponse {
  status: ComandaStatus;
  mensagem: string;
}

export async function fecharComanda(
  comandaId: string,
  payload: FecharComandaPayload
): Promise<FecharComandaResponse> {
  const { data } = await api.post<FecharComandaResponse>(`/comandas/${comandaId}/fechar`, payload);
  return data;
}

export interface CancelarComandaResponse {
  status: ComandaStatus;
  mensagem: string;
}

export async function cancelarComanda(comandaId: string): Promise<CancelarComandaResponse> {
  const { data } = await api.post<CancelarComandaResponse>(`/comandas/${comandaId}/cancelar`);
  return data;
}
