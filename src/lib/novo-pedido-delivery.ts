import type {
  CriarPedidoDeliveryPayload,
  EnderecoNovoPayload,
  ItemPedidoDeliveryPayload,
} from "../services/delivery.service";
import type { FormaPagamento } from "../types/comanda";
import type { CotacaoDelivery } from "../types/delivery";
import {
  type AjustesPedido,
  payloadDosAjustes,
  SEM_AJUSTES,
  type SituacaoCotacao,
} from "./cotacao-delivery";
import { formatarNumeroEntrega } from "./expedicao";
import { formatCurrency } from "./format";
import type { DadosClienteDelivery } from "./identificacao-cliente";

// Tela "Novo pedido delivery" (PED-109, em etapas desde o PED-123): monta o pedido e diz
// o que falta em cada etapa. Valores (taxa, total, troco) são sempre os da cotação do
// backend.

export interface EntradaPedidoDelivery {
  cliente: DadosClienteDelivery | null;
  enderecoNovo: EnderecoNovoPayload | null;
  salvarEndereco: boolean;
  itens: ItemPedidoDeliveryPayload[];
  formaPagamento: FormaPagamento;
  // Em reais; null = sem troco.
  trocoPara: number | null;
  // Desconto e isenção da taxa (PED-126); ausente = sem ajuste.
  ajustes?: AjustesPedido;
}

// Atalhos de "Troco para" (null = sem troco).
export const ATALHOS_TROCO: readonly (number | null)[] = [null, 50, 100, 200];

export function montarPedidoDelivery(
  entrada: EntradaPedidoDelivery,
): CriarPedidoDeliveryPayload | null {
  if (entrada.cliente === null || entrada.itens.length === 0) {
    return null;
  }

  const base = {
    cliente: entrada.cliente.cliente,
    itens: entrada.itens,
    forma_pagamento: entrada.formaPagamento,
    troco_para:
      entrada.formaPagamento === "dinheiro" ? entrada.trocoPara : null,
    ...payloadDosAjustes(entrada.ajustes ?? SEM_AJUSTES),
  };

  if (entrada.cliente.endereco.tipo === "salvo") {
    return { ...base, endereco_id: entrada.cliente.endereco.enderecoId };
  }

  return entrada.enderecoNovo === null
    ? null
    : {
        ...base,
        endereco: entrada.enderecoNovo,
        salvar_endereco: entrada.salvarEndereco,
      };
}

export interface EstadoEnvio extends EntradaPedidoDelivery {
  // O que falta no bloco do cliente (vem da busca: escolher, cadastrar...), ou null.
  motivoCliente: string | null;
  situacaoCotacao: SituacaoCotacao;
  cotacao: CotacaoDelivery | null;
}

// Etapas do pedido (PED-123), na ordem em que o atendente preenche.
export type EtapaPedido = "cliente" | "produtos" | "pagamento";

export const ETAPAS_PEDIDO: readonly { id: EtapaPedido; rotulo: string }[] = [
  { id: "cliente", rotulo: "Cliente" },
  { id: "produtos", rotulo: "Produtos" },
  { id: "pagamento", rotulo: "Pagamento" },
];

const MOTIVO_SEM_CLIENTE = "Escolha um cliente na busca ou cadastre um novo.";

// O que impede concluir a etapa, ou null. Cotação que falhou não bloqueia: o backend
// confere tudo ao criar.
export function pendenciaDaEtapa(
  etapa: EtapaPedido,
  estado: EstadoEnvio,
): string | null {
  const { cotacao } = estado;

  switch (etapa) {
    case "cliente":
      if (estado.motivoCliente !== null || estado.cliente === null) {
        return estado.motivoCliente ?? MOTIVO_SEM_CLIENTE;
      }

      if (
        estado.cliente.endereco.tipo === "novo" &&
        estado.enderecoNovo === null
      ) {
        return "Complete o endereço de entrega (CEP, logradouro, número, bairro, cidade e UF).";
      }

      // O bairro é conferido já na primeira etapa, antes de montar o pedido.
      if (
        estado.situacaoCotacao !== "calculando" &&
        cotacao !== null &&
        !cotacao.atendido
      ) {
        return (
          cotacao.motivo_nao_atendido ??
          "Este endereço não é atendido pelo delivery."
        );
      }

      return null;

    case "produtos":
      if (estado.itens.length === 0) {
        return "Adicione ao menos um item.";
      }

      if (
        estado.situacaoCotacao !== "calculando" &&
        cotacao !== null &&
        !cotacao.pedido_minimo_atingido
      ) {
        return `O pedido mínimo para delivery é ${formatCurrency(cotacao.pedido_minimo)} em itens.`;
      }

      return null;

    case "pagamento":
      if (estado.situacaoCotacao === "calculando") {
        return "Calculando o total...";
      }

      if (cotacao?.desconto_excede_itens) {
        return `O desconto é maior que o valor dos itens (${formatCurrency(cotacao.subtotal)}).`;
      }

      if (
        estado.formaPagamento === "dinheiro" &&
        cotacao !== null &&
        !cotacao.troco_suficiente
      ) {
        return `O troco para é menor que o total (${formatCurrency(cotacao.total)}).`;
      }

      return null;
  }
}

// A primeira etapa com pendência, na ordem das etapas; null quando pode enviar.
export function primeiraPendencia(
  estado: EstadoEnvio,
): { etapa: EtapaPedido; motivo: string } | null {
  for (const { id } of ETAPAS_PEDIDO) {
    const motivo = pendenciaDaEtapa(id, estado);

    if (motivo !== null) {
      return { etapa: id, motivo };
    }
  }

  return null;
}

// O primeiro motivo que impede enviar; null quando pode enviar.
export function motivoQueImpedeEnvio(estado: EstadoEnvio): string | null {
  return primeiraPendencia(estado)?.motivo ?? null;
}

// Uma etapa pode ser aberta quando todas as anteriores estão concluídas.
export function etapaLiberada(
  etapa: EtapaPedido,
  estado: EstadoEnvio,
): boolean {
  const indice = ETAPAS_PEDIDO.findIndex(({ id }) => id === etapa);

  return ETAPAS_PEDIDO.slice(0, indice).every(
    ({ id }) => pendenciaDaEtapa(id, estado) === null,
  );
}

// Concluída = ela e as anteriores sem pendência. A última só se conclui ao enviar: sem
// isso, "Pagamento" (Pix, sem troco) apareceria pronta antes de existir pedido.
export function etapaConcluida(
  etapa: EtapaPedido,
  estado: EstadoEnvio,
): boolean {
  const indice = ETAPAS_PEDIDO.findIndex(({ id }) => id === etapa);

  return (
    indice < ETAPAS_PEDIDO.length - 1 &&
    ETAPAS_PEDIDO.slice(0, indice + 1).every(
      ({ id }) => pendenciaDaEtapa(id, estado) === null,
    )
  );
}

// "Delivery #0007 criado": mesmo formato de número do cupom.
export function mensagemPedidoCriado(numeroEntrega: number): string {
  return `Delivery ${formatarNumeroEntrega(numeroEntrega)} criado`;
}
