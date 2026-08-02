export type StatusPreparo = "pendente" | "em_preparo" | "pronto" | "entregue";

export type StatusItem = "pendente" | "em_preparo" | "pronto" | "entregue" | "cancelado";

export interface PedidoCreatedResponse {
  pedido_id: string;
  status_preparo: StatusPreparo;
  mensagem: string;
}

export interface PedidoItemAtivo {
  id: string;
  produto_nome: string;
  quantidade: number;
  integrante_nome: string | null;
  observacao: string | null;
  status_item: StatusItem;
}

export interface PedidoAtivo {
  id: string;
  comanda_id: string;
  numero_comanda: number;
  garcom_nome: string;
  status_preparo: StatusPreparo;
  criado_em: string;
  itens: PedidoItemAtivo[];
}

export interface UpdatePedidoStatusResponse {
  id: string;
  status_preparo: StatusPreparo;
}

export interface UpdateItemStatusResponse {
  item_id: string;
  status_item: StatusItem;
  pedido: {
    id: string;
    status_preparo: StatusPreparo;
  };
}
