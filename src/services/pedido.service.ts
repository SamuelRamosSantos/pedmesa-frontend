import { api } from "./api";
import type { PedidoAtivo, PedidoCreatedResponse, StatusPreparo, UpdatePedidoStatusResponse } from "../types/pedido";

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

export async function updatePedidoStatus(
  pedidoId: string,
  statusPreparo: StatusPreparo
): Promise<UpdatePedidoStatusResponse> {
  const { data } = await api.patch<UpdatePedidoStatusResponse>(`/pedidos/${pedidoId}/status`, {
    status_preparo: statusPreparo,
  });
  return data;
}
