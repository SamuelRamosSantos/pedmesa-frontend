import type { Cliente } from "../types/cliente";
import type { EstadoConsulta } from "./consulta-por-chave";
import { telefoneProntoParaBusca } from "./identificacao-cliente";
import { mascararTelefone, somenteDigitos } from "./mascaras";

// Busca única de cliente (PED-123): o mesmo campo aceita nome ou telefone. Telefone
// completo puxa o cadastro (ou abre o de cliente novo); nome lista quem bate.

export type ClassificacaoBusca =
  | { tipo: "vazia" }
  // Ainda curto demais para buscar.
  | { tipo: "curta" }
  | { tipo: "telefone"; digitos: string; completo: boolean }
  | { tipo: "nome"; texto: string };

// Só caracteres de telefone: dígitos e a máscara "(11) 98765-4321", "+55".
const SO_TELEFONE = /^[\d\s()+\-.]+$/;
export const MIN_LETRAS_NOME = 2;
export const MIN_DIGITOS_TELEFONE = 4;

export function classificarBusca(termo: string): ClassificacaoBusca {
  const limpo = termo.trim().replace(/\s+/g, " ");

  if (limpo === "") {
    return { tipo: "vazia" };
  }

  if (SO_TELEFONE.test(limpo)) {
    // Pela máscara, para tirar o "+55" e o zero de operadora como o backend faz.
    const digitos = somenteDigitos(mascararTelefone(limpo));

    if (digitos.length < MIN_DIGITOS_TELEFONE) {
      return { tipo: "curta" };
    }

    return {
      tipo: "telefone",
      digitos,
      completo: telefoneProntoParaBusca(digitos),
    };
  }

  if (limpo.replace(/\s/g, "").length < MIN_LETRAS_NOME) {
    return { tipo: "curta" };
  }

  return { tipo: "nome", texto: limpo };
}

// O que vai para GET /clientes?busca=, ou null quando ainda não busca.
export function termoParaConsulta(
  classificacao: ClassificacaoBusca,
): string | null {
  switch (classificacao.tipo) {
    case "telefone":
      return classificacao.digitos;
    case "nome":
      return classificacao.texto;
    default:
      return null;
  }
}

// Máscara de telefone só quando o campo tem cara de telefone; nome fica como digitado.
export function formatarTermoDigitado(valor: string): string {
  return SO_TELEFONE.test(valor) && /\d/.test(valor)
    ? mascararTelefone(valor)
    : valor;
}

// O cliente cujo telefone é exatamente o digitado.
export function clienteDoTelefone(
  clientes: readonly Cliente[],
  digitos: string,
): Cliente | null {
  return clientes.find((cliente) => cliente.telefone === digitos) ?? null;
}

export interface CamposClienteNovo {
  nome: string;
  // Com máscara, como aparece no campo.
  telefone: string;
}

// O cadastro de cliente novo já começa com o que foi buscado.
export function cadastroAPartirDaBusca(
  classificacao: ClassificacaoBusca,
): CamposClienteNovo {
  if (classificacao.tipo === "telefone") {
    return { nome: "", telefone: mascararTelefone(classificacao.digitos) };
  }

  if (classificacao.tipo === "nome") {
    return { nome: classificacao.texto, telefone: "" };
  }

  return { nome: "", telefone: "" };
}

// O que falta no cadastro de cliente novo, ou null quando dá para seguir.
export function pendenciaDoCadastro(campos: CamposClienteNovo): string | null {
  const nomeVazio = campos.nome.trim() === "";
  const telefoneOk = telefoneProntoParaBusca(somenteDigitos(campos.telefone));

  if (nomeVazio && !telefoneOk) {
    return "Informe o nome e o telefone do cliente.";
  }

  if (nomeVazio) {
    return "Informe o nome do cliente.";
  }

  return telefoneOk ? null : "Informe o telefone com DDD.";
}

export type SituacaoBusca =
  | "vazia"
  | "curta"
  | "buscando"
  | "resultados"
  | "sem_resultado"
  | "falhou";

// `aguardandoDigitacao`: o termo mudou e o debounce não terminou; já mostra "buscando".
export function situacaoDaBusca(
  classificacao: ClassificacaoBusca,
  consulta: EstadoConsulta<{ clientes: readonly Cliente[] }>,
  aguardandoDigitacao: boolean,
): SituacaoBusca {
  if (classificacao.tipo === "vazia" || classificacao.tipo === "curta") {
    return classificacao.tipo;
  }

  if (aguardandoDigitacao || consulta.status === "carregando") {
    return "buscando";
  }

  if (consulta.status === "falhou" || consulta.valor === null) {
    return "falhou";
  }

  return consulta.valor.clientes.length > 0 ? "resultados" : "sem_resultado";
}
