import type { CriarPedidoDeliveryPayload, EnderecoNovoPayload, ItemPedidoDeliveryPayload } from "../services/delivery.service";
import type { FormaPagamento } from "../types/comanda";
import type { CotacaoDelivery } from "../types/delivery";
import type { SituacaoCotacao } from "./cotacao-delivery";
import { formatarNumeroEntrega } from "./expedicao";
import { formatCurrency } from "./format";
import type { DadosClienteDelivery } from "./identificacao-cliente";

// Tela "Novo pedido delivery" (PED-109): monta o pedido e diz se ele pode ser enviado.
// Valores (taxa, total, troco) são sempre os da cotação do backend.

export interface EntradaPedidoDelivery {
  cliente: DadosClienteDelivery | null;
  enderecoNovo: EnderecoNovoPayload | null;
  salvarEndereco: boolean;
  itens: ItemPedidoDeliveryPayload[];
  formaPagamento: FormaPagamento;
  // Em reais; null = sem troco.
  trocoPara: number | null;
}

// Atalhos de "Troco para" (null = sem troco).
export const ATALHOS_TROCO: readonly (number | null)[] = [null, 50, 100, 200];

export function montarPedidoDelivery(entrada: EntradaPedidoDelivery): CriarPedidoDeliveryPayload | null {
  if (entrada.cliente === null || entrada.itens.length === 0) {
    return null;
  }

  const base = {
    cliente: entrada.cliente.cliente,
    itens: entrada.itens,
    forma_pagamento: entrada.formaPagamento,
    troco_para: entrada.formaPagamento === "dinheiro" ? entrada.trocoPara : null,
  };

  if (entrada.cliente.endereco.tipo === "salvo") {
    return { ...base, endereco_id: entrada.cliente.endereco.enderecoId };
  }

  return entrada.enderecoNovo === null
    ? null
    : { ...base, endereco: entrada.enderecoNovo, salvar_endereco: entrada.salvarEndereco };
}

export interface EstadoEnvio extends EntradaPedidoDelivery {
  situacaoCotacao: SituacaoCotacao;
  cotacao: CotacaoDelivery | null;
}

// O primeiro motivo que impede enviar, na ordem em que o atendente preenche a tela; null
// quando pode enviar. Cotação que falhou não bloqueia: o backend confere tudo ao criar.
export function motivoQueImpedeEnvio(estado: EstadoEnvio): string | null {
  if (estado.cliente === null) {
    return "Informe o telefone e o nome do cliente.";
  }

  if (estado.cliente.endereco.tipo === "novo" && estado.enderecoNovo === null) {
    return "Complete o endereço de entrega (CEP, logradouro, número, bairro, cidade e UF).";
  }

  if (estado.itens.length === 0) {
    return "Adicione ao menos um item.";
  }

  if (estado.situacaoCotacao === "calculando") {
    return "Calculando o total...";
  }

  const { cotacao } = estado;

  if (cotacao === null) {
    return null;
  }

  if (!cotacao.atendido) {
    return cotacao.motivo_nao_atendido ?? "Este endereço não é atendido pelo delivery.";
  }

  if (!cotacao.pedido_minimo_atingido) {
    return `O pedido mínimo para delivery é ${formatCurrency(cotacao.pedido_minimo)} em itens.`;
  }

  if (estado.formaPagamento === "dinheiro" && !cotacao.troco_suficiente) {
    return `O troco para é menor que o total (${formatCurrency(cotacao.total)}).`;
  }

  return null;
}

// "Delivery #0007 criado": mesmo formato de número do cupom.
export function mensagemPedidoCriado(numeroEntrega: number): string {
  return `Delivery ${formatarNumeroEntrega(numeroEntrega)} criado`;
}
