import { DIGITOS_CEP, somenteDigitos } from "../lib/mascaras";
import { mapearRespostaViaCep } from "../lib/via-cep";
import type { EnderecoCep } from "../types/cep";

// Provedor externo: NUNCA usar a instância `api`. O interceptor dela anexa o token e o
// tenant, que não podem ir para terceiros, e um erro do ViaCEP não pode deslogar ninguém
// (PED-106). Por isso fetch próprio, sem credenciais e sem referrer.
const VIA_CEP_URL = "https://viacep.com.br/ws";
const TIMEOUT_PADRAO_MS = 3000;

export type BuscarEnderecoPorCep = (
  cep: string,
  signal?: AbortSignal,
) => Promise<EnderecoCep | null>;

export interface BuscadorCepOpcoes {
  fetch?: typeof fetch;
  timeoutMs?: number;
}

// Fábrica para os testes injetarem um fetch falso; as telas usam `buscarEnderecoPorCep`.
export function criarBuscadorCep({
  fetch: fetchFn = (entrada, init) => fetch(entrada, init),
  timeoutMs = TIMEOUT_PADRAO_MS,
}: BuscadorCepOpcoes = {}): BuscarEnderecoPorCep {
  // Cache da sessão, inclusive de CEP inexistente (null). Falhas não entram: tenta de novo.
  const cache = new Map<string, EnderecoCep | null>();

  return async (cep, signal) => {
    const digitos = somenteDigitos(cep);

    if (digitos.length !== DIGITOS_CEP) {
      return null;
    }

    if (cache.has(digitos)) {
      return cache.get(digitos) ?? null;
    }

    // Um só controller para o timeout e para o cancelamento de quem chamou.
    const controller = new AbortController();
    const cancelar = () => controller.abort();
    const timeout = setTimeout(cancelar, timeoutMs);

    if (signal?.aborted) {
      cancelar();
    }
    signal?.addEventListener("abort", cancelar, { once: true });

    try {
      const resposta = await fetchFn(`${VIA_CEP_URL}/${digitos}/json/`, {
        signal: controller.signal,
        credentials: "omit",
        referrerPolicy: "no-referrer",
      });

      if (!resposta.ok) {
        throw new Error(`ViaCEP respondeu com status ${resposta.status}.`);
      }

      const endereco = mapearRespostaViaCep(await resposta.json());
      cache.set(digitos, endereco);

      return endereco;
    } finally {
      clearTimeout(timeout);
      signal?.removeEventListener("abort", cancelar);
    }
  };
}

export const buscarEnderecoPorCep = criarBuscadorCep();
