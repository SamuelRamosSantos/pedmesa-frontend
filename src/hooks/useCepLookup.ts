import { estadoDoCepLookup, type EstadoCepLookup } from "../lib/cep-lookup";
import { DIGITOS_CEP, somenteDigitos } from "../lib/mascaras";
import { buscarEnderecoPorCep } from "../services/cep.service";
import type { EnderecoCep } from "../types/cep";
import { useConsultaPorChave } from "./useConsultaPorChave";

// Consulta o endereço do CEP enquanto o atendente digita (PED-106). Ao mudar o CEP, a
// consulta anterior é cancelada; o estado só reflete a resposta do CEP atual.
// `aoEncontrar` roda uma vez por CEP encontrado (ex.: preencher o formulário, PED-108).
export function useCepLookup(cep: string, aoEncontrar?: (endereco: EnderecoCep) => void): EstadoCepLookup {
  const digitos = somenteDigitos(cep);
  const consulta = useConsultaPorChave(digitos.length === DIGITOS_CEP ? digitos : null, buscarEnderecoPorCep, (resultado) => {
    if (resultado.status === "concluida" && resultado.valor !== null) {
      aoEncontrar?.(resultado.valor);
    }
  });

  return estadoDoCepLookup(consulta);
}
