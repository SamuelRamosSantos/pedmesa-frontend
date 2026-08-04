import type { StatusItem } from "../../types/pedido";

export interface ItemDoGrupoPreparo {
  id: string;
  produtoNome: string;
  quantidade: number;
  integranteNome: string | null;
  observacao: string | null;
}

export interface GrupoPreparo {
  pedidoId: string;
  numeroComanda: number;
  garcomNome: string;
  criadoEm: string;
  statusGrupo: StatusItem;
  itens: ItemDoGrupoPreparo[];
}
