import type { EnderecoCep } from "../types/cep";
import type { EstadoConsulta } from "./consulta-por-chave";

export type StatusCepLookup = "idle" | "carregando" | "encontrado" | "nao_encontrado" | "falhou";

export interface EstadoCepLookup {
  status: StatusCepLookup;
  endereco: EnderecoCep | null;
}

// Traduz o estado genérico da consulta para o vocabulário do CEP: consulta concluída sem
// endereço é CEP inexistente.
export function estadoDoCepLookup(consulta: EstadoConsulta<EnderecoCep | null>): EstadoCepLookup {
  if (consulta.status === "concluida") {
    return consulta.valor === null
      ? { status: "nao_encontrado", endereco: null }
      : { status: "encontrado", endereco: consulta.valor };
  }

  return { status: consulta.status, endereco: null };
}
