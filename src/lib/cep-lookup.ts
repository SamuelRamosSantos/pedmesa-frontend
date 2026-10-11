import type { EnderecoCep } from "../types/cep";
import { DIGITOS_CEP } from "./mascaras";

export type StatusCepLookup = "idle" | "carregando" | "encontrado" | "nao_encontrado" | "falhou";

// Resultado de uma consulta concluída, marcado com o CEP consultado.
export interface ResultadoCepLookup {
  cep: string;
  status: Extract<StatusCepLookup, "encontrado" | "nao_encontrado" | "falhou">;
  endereco: EnderecoCep | null;
}

export interface EstadoCepLookup {
  status: StatusCepLookup;
  endereco: EnderecoCep | null;
}

// Estado exibido para os dígitos digitados agora. Um resultado de outro CEP (resposta
// antiga) nunca aparece: enquanto o CEP atual não responde, o estado é "carregando".
export function estadoDoCepLookup(digitos: string, ultimoResultado: ResultadoCepLookup | null): EstadoCepLookup {
  if (digitos.length !== DIGITOS_CEP) {
    return { status: "idle", endereco: null };
  }

  if (ultimoResultado === null || ultimoResultado.cep !== digitos) {
    return { status: "carregando", endereco: null };
  }

  return { status: ultimoResultado.status, endereco: ultimoResultado.endereco };
}
