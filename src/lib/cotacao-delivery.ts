import type { CotacaoDeliveryPayload, ItemPedidoDeliveryPayload } from "../services/delivery.service";
import type { FormaPagamento } from "../types/comanda";
import type { CotacaoDelivery } from "../types/delivery";
import type { EstadoConsulta } from "./consulta-por-chave";
import type { Localidade } from "./endereco-entrega";

// Cotação do pedido delivery na tela (PED-108/PED-109). Quem calcula é sempre o backend:
// aqui só se monta o pedido de cotação e se interpreta a resposta.

export interface EntradaCotacao {
  localidade: Localidade | null;
  itens: ItemPedidoDeliveryPayload[];
  formaPagamento: FormaPagamento;
  trocoPara: number | null;
}

// null sem cidade e bairro. "Troco para" só vai em dinheiro (o backend recusa nas outras).
export function payloadDaCotacao(entrada: EntradaCotacao): CotacaoDeliveryPayload | null {
  if (entrada.localidade === null) {
    return null;
  }

  return {
    endereco: entrada.localidade,
    itens: entrada.itens,
    forma_pagamento: entrada.formaPagamento,
    troco_para: entrada.formaPagamento === "dinheiro" ? entrada.trocoPara : null,
  };
}

export type SituacaoCotacao = "sem_endereco" | "calculando" | "atendido" | "nao_atendido" | "falhou";

// `aguardandoDigitacao`: o pedido mudou e o debounce ainda não terminou; o valor anterior
// está velho, então já mostra "calculando".
export function situacaoDaCotacao(consulta: EstadoConsulta<CotacaoDelivery>, aguardandoDigitacao: boolean): SituacaoCotacao {
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
export function bloqueioDoEnvio(cotacao: CotacaoDelivery | null): string | null {
  if (cotacao === null || cotacao.atendido) {
    return null;
  }

  return cotacao.motivo_nao_atendido ?? "Este endereço não é atendido pelo delivery.";
}
