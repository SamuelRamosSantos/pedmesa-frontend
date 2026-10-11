import { estadoDoCepLookup, type EstadoCepLookup } from "../lib/cep-lookup";
import { DIGITOS_CEP, somenteDigitos } from "../lib/mascaras";
import { buscarEnderecoPorCep } from "../services/cep.service";
import { useConsultaPorChave } from "./useConsultaPorChave";

// Consulta o endereço do CEP enquanto o atendente digita (PED-106). Ao mudar o CEP, a
// consulta anterior é cancelada; o estado só reflete a resposta do CEP atual.
export function useCepLookup(cep: string): EstadoCepLookup {
  const digitos = somenteDigitos(cep);
  const consulta = useConsultaPorChave(digitos.length === DIGITOS_CEP ? digitos : null, buscarEnderecoPorCep);

  return estadoDoCepLookup(consulta);
}
