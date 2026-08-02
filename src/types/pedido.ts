export type StatusPreparo = "pendente" | "em_preparo" | "pronto" | "entregue";

export interface PedidoCreatedResponse {
  pedido_id: string;
  status_preparo: StatusPreparo;
  mensagem: string;
}
