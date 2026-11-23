import type {
  AjustesPedidoPayload,
  CotacaoDeliveryPayload,
  ItemPedidoDeliveryPayload,
} from "../services/delivery.service";
import type { FormaPagamento } from "../types/comanda";
import type { CotacaoDelivery } from "../types/delivery";
import type { EstadoConsulta } from "./consulta-por-chave";
import type { Localidade } from "./endereco-entrega";

// Cotação do pedido delivery na tela (PED-108/PED-109). Quem calcula é sempre o backend:
// aqui só se monta o pedido de cotação e se interpreta a resposta.

// Desconto nos itens e isenção da taxa escolhidos na etapa de pagamento (PED-126).
export interface AjustesPedido {
  descontoTipo: "percentual" | "valor_fixo";
  // 0 = sem desconto.
  descontoValor: number;
  isentarTaxa: boolean;
}

export const SEM_AJUSTES: AjustesPedido = {
  descontoTipo: "percentual",
  descontoValor: 0,
  isentarTaxa: false,
};

// Só manda o que foi ajustado: sem desconto e sem isenção, o corpo fica como antes.
export function payloadDosAjustes(
  ajustes: AjustesPedido,
): AjustesPedidoPayload {
  return {
    ...(ajustes.descontoValor > 0
      ? {
          desconto_tipo: ajustes.descontoTipo,
          desconto_valor: ajustes.descontoValor,
        }
      : {}),
    ...(ajustes.isentarTaxa ? { isentar_taxa_entrega: true } : {}),
  };
}

export interface EntradaCotacao {
  localidade: Localidade | null;
  itens: ItemPedidoDeliveryPayload[];
  formaPagamento: FormaPagamento;
  trocoPara: number | null;
  ajustes?: AjustesPedido;
}

// null sem cidade e bairro. "Troco para" só vai em dinheiro (o backend recusa nas outras).
export function payloadDaCotacao(
  entrada: EntradaCotacao,
): CotacaoDeliveryPayload | null {
  if (entrada.localidade === null) {
    return null;
  }

  return {
    endereco: entrada.localidade,
    itens: entrada.itens,
    forma_pagamento: entrada.formaPagamento,
    troco_para:
      entrada.formaPagamento === "dinheiro" ? entrada.trocoPara : null,
    ...payloadDosAjustes(entrada.ajustes ?? SEM_AJUSTES),
  };
}

export type SituacaoCotacao =
  | "sem_endereco"
  | "calculando"
  | "atendido"
  | "nao_atendido"
  | "falhou";

// `aguardandoDigitacao`: o pedido mudou e o debounce ainda não terminou; o valor anterior
// está velho, então já mostra "calculando".
export function situacaoDaCotacao(
  consulta: EstadoConsulta<CotacaoDelivery>,
  aguardandoDigitacao: boolean,
): SituacaoCotacao {
  if (aguardandoDigitacao || consulta.status === "carregando") {
    return "calculando";
  }

  if (consulta.status === "idle") {
    return "sem_endereco";
  }

  if (consulta.status === "falhou" || consulta.valor === null) {
    return "falhou";
  }

  return consulta.valor.atendido ? "atendido" : "nao_atendido";
}

// Motivo que impede enviar o pedido, ou null. Bairro não atendido bloqueia com a mensagem
// do backend; falha na cotação não bloqueia (o backend confere tudo de novo ao criar).
export function bloqueioDoEnvio(
  cotacao: CotacaoDelivery | null,
): string | null {
  if (cotacao === null || cotacao.atendido) {
    return null;
  }

  return (
    cotacao.motivo_nao_atendido ?? "Este endereço não é atendido pelo delivery."
  );
}
