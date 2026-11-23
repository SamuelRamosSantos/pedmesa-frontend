import type { CreateClientePayload } from "../services/cliente.service";
import type { Cliente } from "../types/cliente";
import { telefoneProntoParaBusca } from "./identificacao-cliente";
import { mascararTelefone, somenteDigitos } from "./mascaras";

// Tela de clientes cadastrados do delivery (PED-124). Mesmos limites do backend; a
// validação definitiva (telefone duplicado etc.) continua sendo dele.

export const NOME_CLIENTE_MAX = 120;
export const OBSERVACOES_CLIENTE_MAX = 500;

export interface FormCliente {
  nome: string;
  // Com máscara, como aparece no campo.
  telefone: string;
  observacoes: string;
}

export type CampoFormCliente = keyof FormCliente;

export function formDoCliente(cliente: Cliente | null): FormCliente {
  return {
    nome: cliente?.nome ?? "",
    telefone: cliente ? mascararTelefone(cliente.telefone) : "",
    observacoes: cliente?.observacoes ?? "",
  };
}

export type ResultadoFormCliente =
  | { ok: true; payload: Required<CreateClientePayload> }
  | { ok: false; erros: Partial<Record<CampoFormCliente, string>> };

export function validarFormCliente(form: FormCliente): ResultadoFormCliente {
  const erros: Partial<Record<CampoFormCliente, string>> = {};
  const nome = form.nome.trim();
  const telefone = somenteDigitos(form.telefone);
  const observacoes = form.observacoes.trim();

  if (nome === "") {
    erros.nome = "Informe o nome do cliente.";
  } else if (nome.length > NOME_CLIENTE_MAX) {
    erros.nome = `Use no máximo ${NOME_CLIENTE_MAX} caracteres.`;
  }

  if (!telefoneProntoParaBusca(telefone)) {
    erros.telefone = "Informe um telefone com DDD, fixo ou celular.";
  }

  if (observacoes.length > OBSERVACOES_CLIENTE_MAX) {
    erros.observacoes = `Use no máximo ${OBSERVACOES_CLIENTE_MAX} caracteres.`;
  }

  if (Object.keys(erros).length > 0) {
    return { ok: false, erros };
  }

  return {
    ok: true,
    payload: { nome, telefone, observacoes: observacoes || null },
  };
}

export function totalDePaginas(total: number, porPagina: number): number {
  return Math.max(1, Math.ceil(total / porPagina));
}
