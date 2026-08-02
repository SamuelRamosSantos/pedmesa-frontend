import { api } from "./api";
import type { PedidoCreatedResponse } from "../types/pedido";

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
