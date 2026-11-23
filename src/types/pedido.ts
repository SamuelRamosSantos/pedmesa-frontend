import type { TipoAtendimento } from "./comanda";

export type StatusPreparo = "pendente" | "em_preparo" | "pronto" | "entregue";

export type StatusItem =
  | "pendente"
  | "em_preparo"
  | "pronto"
  | "entregue"
  | "cancelado";

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
  precisa_preparo: boolean;
}

export interface PedidoAtivo {
  id: string;
  comanda_id: string;
  tipo_atendimento: TipoAtendimento;
  // Mesa: numero_comanda. Delivery: numero_entrega (o outro vem null).
  numero_comanda: number | null;
  numero_entrega: number | null;
  usuario_id: string;
  garcom_nome: string;
  status_preparo: StatusPreparo;
  criado_em: string;
  itens: PedidoItemAtivo[];
}

export interface UpdateItemStatusResponse {
  item_id: string;
  status_item: StatusItem;
  pedido: {
    id: string;
    status_preparo: StatusPreparo;
  };
}
