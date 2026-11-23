import type { IdentificacaoAtendimento } from "../../lib/atendimento-kds";
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
  // Mesa N ou DELIVERY #0007 (PED-112).
  identificacao: IdentificacaoAtendimento;
  garcomNome: string;
  criadoEm: string;
  statusGrupo: StatusItem;
  itens: ItemDoGrupoPreparo[];
}
