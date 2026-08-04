import { api } from "./api";
import type { PedidoAtivo, PedidoCreatedResponse, StatusItem, UpdateItemStatusResponse } from "../types/pedido";

export interface CreatePedidoItemPayload {
  produto_id: string;
  integrante_id: string | null;
  quantidade: number;
  observacao: string | null;
}

export interface CreatePedidoPayload {
  itens: CreatePedidoItemPayload[];
}

export async function createPedido(comandaId: string, payload: CreatePedidoPayload): Promise<PedidoCreatedResponse> {
  const { data } = await api.post<PedidoCreatedResponse>(`/comandas/${comandaId}/pedidos`, payload);
  return data;
}

export async function listPedidos(): Promise<PedidoAtivo[]> {
  const { data } = await api.get<PedidoAtivo[]>("/pedidos");
  return data;
}

export async function updateItemStatus(itemId: string, status: StatusItem): Promise<UpdateItemStatusResponse> {
  const { data } = await api.patch<UpdateItemStatusResponse>(`/pedidos/itens/${itemId}/status`, { status });
  return data;
}
