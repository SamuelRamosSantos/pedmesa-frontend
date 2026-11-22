import type { Cliente, EnderecoCliente, ListaClientes } from "../types/cliente";
import { api } from "./api";

// Telefone e CEP podem ir mascarados: o backend normaliza para só dígitos.
export interface CreateClientePayload {
  nome: string;
  telefone: string;
  observacoes?: string | null;
}

// Atualização parcial. observacoes: null limpa o campo; ausente mantém.
export type UpdateClientePayload = Partial<CreateClientePayload>;

export interface CreateEnderecoClientePayload {
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string | null;
  bairro: string;
  cidade: string;
  uf: string;
  referencia?: string | null;
  principal?: boolean;
}

// Atualização parcial. principal só aceita true: para trocar, marque outro endereço.
export type UpdateEnderecoClientePayload = Partial<
  Omit<CreateEnderecoClientePayload, "principal">
> & {
  principal?: true;
};

// null quando não há cliente com esse telefone. `signal` cancela a busca se o telefone mudar.
export async function buscarClientePorTelefone(
  telefone: string,
  signal?: AbortSignal,
): Promise<Cliente | null> {
  const { data } = await api.get<Cliente | null>("/clientes", {
    params: { telefone },
    signal,
  });
  return data;
}

export interface FiltroClientes {
  // Nome ou telefone (com ou sem máscara); vazio lista todos.
  busca?: string;
  pagina?: number;
  porPagina?: number;
}

// Listagem paginada com a busca única por nome ou telefone (PED-122).
export async function listarClientes(
  filtro: FiltroClientes,
  signal?: AbortSignal,
): Promise<ListaClientes> {
  const { data } = await api.get<ListaClientes>("/clientes", {
    params: {
      busca: filtro.busca || undefined,
      pagina: filtro.pagina,
      por_pagina: filtro.porPagina,
    },
    signal,
  });
  return data;
}

export async function createCliente(
  payload: CreateClientePayload,
): Promise<Cliente> {
  const { data } = await api.post<Cliente>("/clientes", payload);
  return data;
}

export async function updateCliente(
  clienteId: string,
  payload: UpdateClientePayload,
): Promise<Cliente> {
  const { data } = await api.patch<Cliente>(`/clientes/${clienteId}`, payload);
  return data;
}

export async function createEnderecoCliente(
  clienteId: string,
  payload: CreateEnderecoClientePayload,
): Promise<EnderecoCliente> {
  const { data } = await api.post<EnderecoCliente>(
    `/clientes/${clienteId}/enderecos`,
    payload,
  );
  return data;
}

export async function updateEnderecoCliente(
  clienteId: string,
  enderecoId: string,
  payload: UpdateEnderecoClientePayload,
): Promise<EnderecoCliente> {
  const { data } = await api.patch<EnderecoCliente>(
    `/clientes/${clienteId}/enderecos/${enderecoId}`,
    payload,
  );
  return data;
}

export async function deleteEnderecoCliente(
  clienteId: string,
  enderecoId: string,
): Promise<void> {
  await api.delete(`/clientes/${clienteId}/enderecos/${enderecoId}`);
}
