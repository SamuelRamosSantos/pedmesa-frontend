import type { FormaPagamento } from "../types/comanda";
import type {
  CotacaoDelivery,
  DetalheEntrega,
  EntregaEstado,
  EntregaPainel,
  PedidoDeliveryCriado,
  StatusEntrega,
  TaxaEntrega,
} from "../types/delivery";
import { api } from "./api";
import type {
  CreateClientePayload,
  CreateEnderecoClientePayload,
} from "./cliente.service";

// Só a intenção do atendente: preço, taxa, total e troco são calculados no backend.
export interface ItemPedidoDeliveryPayload {
  produto_id: string;
  quantidade: number;
  observacao?: string | null;
}

// Desconto nos itens e isenção da taxa (PED-126). Criar o pedido com eles exige a
// permissão de desconto; o backend confere pelo token.
export interface AjustesPedidoPayload {
  desconto_tipo?: "percentual" | "valor_fixo";
  desconto_valor?: number;
  isentar_taxa_entrega?: boolean;
}

export interface CotacaoDeliveryPayload extends AjustesPedidoPayload {
  endereco: { cidade: string; bairro: string };
  // Pode ir vazio: cota só o frete, antes de montar o carrinho (PED-108).
  itens: ItemPedidoDeliveryPayload[];
  forma_pagamento: FormaPagamento;
  // Valor em reais que o cliente vai entregar; null ou ausente = valor exato.
  troco_para?: number | null;
}

export type EnderecoNovoPayload = Omit<
  CreateEnderecoClientePayload,
  "principal"
>;

// Exatamente uma das formas: endereço salvo do cliente ou endereço novo.
export type EnderecoDoPedidoPayload =
  | { endereco_id: string; endereco?: never; salvar_endereco?: never }
  | {
      endereco: EnderecoNovoPayload;
      salvar_endereco?: boolean;
      endereco_id?: never;
    };

export type CriarPedidoDeliveryPayload = EnderecoDoPedidoPayload &
  AjustesPedidoPayload & {
    cliente: CreateClientePayload;
    itens: ItemPedidoDeliveryPayload[];
    forma_pagamento: FormaPagamento;
    troco_para?: number | null;
  };

export interface TransicaoEntregaPayload {
  status: StatusEntrega;
  // A versão que estava na tela; se outra pessoa mudou a entrega, a API responde 409.
  versao: number;
  // Obrigatório ao cancelar e ao voltar de "em rota" (mínimo de 5 caracteres).
  motivo?: string | null;
}

export interface ListarEntregasFiltro {
  status?: StatusEntrega;
}

export interface CreateTaxaEntregaPayload {
  cidade: string;
  bairro: string;
  valor: number;
  tempo_estimado_min?: number | null;
  ativo?: boolean;
}

// Atualização parcial. tempo_estimado_min: null remove a estimativa; ausente mantém.
export type UpdateTaxaEntregaPayload = Partial<CreateTaxaEntregaPayload>;

export async function cotarPedidoDelivery(
  payload: CotacaoDeliveryPayload,
  signal?: AbortSignal,
): Promise<CotacaoDelivery> {
  const { data } = await api.post<CotacaoDelivery>(
    "/delivery/cotacao",
    payload,
    { signal },
  );
  return data;
}

export async function criarPedidoDelivery(
  payload: CriarPedidoDeliveryPayload,
): Promise<PedidoDeliveryCriado> {
  const { data } = await api.post<PedidoDeliveryCriado>(
    "/delivery/pedidos",
    payload,
  );
  return data;
}

export async function listarEntregas(
  filtro: ListarEntregasFiltro = {},
): Promise<EntregaPainel[]> {
  const { data } = await api.get<EntregaPainel[]>("/delivery/entregas", {
    params: filtro.status ? { status: filtro.status } : undefined,
  });
  return data;
}

// Detalhe completo da entrega para o modal da expedição (PED-130).
export async function buscarDetalheEntrega(
  entregaId: string,
  signal?: AbortSignal,
): Promise<DetalheEntrega> {
  const { data } = await api.get<DetalheEntrega>(
    `/delivery/entregas/${entregaId}`,
    { signal },
  );
  return data;
}

export async function transicionarEntrega(
  entregaId: string,
  payload: TransicaoEntregaPayload,
): Promise<EntregaEstado> {
  const { data } = await api.patch<EntregaEstado>(
    `/delivery/entregas/${entregaId}/status`,
    payload,
  );
  return data;
}

export async function reimprimirTicketEntrega(
  entregaId: string,
): Promise<{ mensagem: string }> {
  const { data } = await api.post<{ mensagem: string }>(
    `/delivery/entregas/${entregaId}/reimprimir-ticket`,
  );
  return data;
}

export async function listTaxasEntrega(): Promise<TaxaEntrega[]> {
  const { data } = await api.get<TaxaEntrega[]>("/delivery/taxas");
  return data;
}

export async function createTaxaEntrega(
  payload: CreateTaxaEntregaPayload,
): Promise<TaxaEntrega> {
  const { data } = await api.post<TaxaEntrega>("/delivery/taxas", payload);
  return data;
}

export async function updateTaxaEntrega(
  taxaId: string,
  payload: UpdateTaxaEntregaPayload,
): Promise<TaxaEntrega> {
  const { data } = await api.patch<TaxaEntrega>(
    `/delivery/taxas/${taxaId}`,
    payload,
  );
  return data;
}

export async function deleteTaxaEntrega(taxaId: string): Promise<void> {
  await api.delete(`/delivery/taxas/${taxaId}`);
}
