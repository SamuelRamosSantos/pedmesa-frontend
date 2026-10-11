import { useEffect, useState } from "react";
import { estadoDoCepLookup, type EstadoCepLookup, type ResultadoCepLookup } from "../lib/cep-lookup";
import { DIGITOS_CEP, somenteDigitos } from "../lib/mascaras";
import { buscarEnderecoPorCep } from "../services/cep.service";

// Consulta o endereço do CEP enquanto o atendente digita (PED-106). Ao mudar o CEP, a
// consulta anterior é cancelada; o estado só reflete a resposta do CEP atual.
export function useCepLookup(cep: string): EstadoCepLookup {
  const digitos = somenteDigitos(cep);
  const [ultimoResultado, setUltimoResultado] = useState<ResultadoCepLookup | null>(null);

  useEffect(() => {
    if (digitos.length !== DIGITOS_CEP) {
      return;
    }

    const controller = new AbortController();

    buscarEnderecoPorCep(digitos, controller.signal)
      .then((endereco) => {
        setUltimoResultado({ cep: digitos, status: endereco ? "encontrado" : "nao_encontrado", endereco });
      })
      .catch(() => {
        // Cancelado por nós (CEP mudou ou tela fechou): não é falha.
        if (!controller.signal.aborted) {
          setUltimoResultado({ cep: digitos, status: "falhou", endereco: null });
        }
      });

    return () => controller.abort();
  }, [digitos]);

  return estadoDoCepLookup(digitos, ultimoResultado);
}
