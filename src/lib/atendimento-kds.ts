import type { PedidoAtivo } from "../types/pedido";
import { formatarNumeroEntrega } from "./expedicao";

// Como o cartão do KDS identifica o pedido (PED-112): número da mesa ou o badge
// "DELIVERY #0007", no mesmo formato do cupom.

export interface IdentificacaoAtendimento {
  delivery: boolean;
  rotulo: string;
  numero: string;
}

export function identificacaoNoKds(
  pedido: Pick<
    PedidoAtivo,
    "tipo_atendimento" | "numero_comanda" | "numero_entrega"
  >,
): IdentificacaoAtendimento {
  if (pedido.tipo_atendimento === "delivery") {
    return {
      delivery: true,
      rotulo: "Delivery",
      numero:
        pedido.numero_entrega === null
          ? "—"
          : formatarNumeroEntrega(pedido.numero_entrega),
    };
  }

  return {
    delivery: false,
    rotulo: "Mesa",
    numero:
      pedido.numero_comanda === null ? "—" : String(pedido.numero_comanda),
  };
}
