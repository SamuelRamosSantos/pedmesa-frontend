import type { EnderecoNovoPayload } from "../services/delivery.service";
import type { EnderecoCep } from "../types/cep";
import type { Cliente, EnderecoCliente } from "../types/cliente";
import type { EscolhaEndereco } from "./identificacao-cliente";
import { DIGITOS_CEP, mascararCep, somenteDigitos } from "./mascaras";

// Endereço de entrega do novo pedido delivery (PED-108).

export interface CamposEndereco {
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  referencia: string;
}

export const CAMPOS_ENDERECO_VAZIOS: CamposEndereco = {
  cep: "",
  logradouro: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  uf: "",
  referencia: "",
};

// Campos do formulário a partir de um endereço salvo (edição, PED-124).
export function camposDoEnderecoSalvo(
  endereco: Pick<
    EnderecoCliente,
    | "cep"
    | "logradouro"
    | "numero"
    | "complemento"
    | "bairro"
    | "cidade"
    | "uf"
    | "referencia"
  >,
): CamposEndereco {
  return {
    cep: mascararCep(endereco.cep),
    logradouro: endereco.logradouro,
    numero: endereco.numero,
    complemento: endereco.complemento ?? "",
    bairro: endereco.bairro,
    cidade: endereco.cidade,
    uf: endereco.uf,
    referencia: endereco.referencia ?? "",
  };
}

export type CampoParaFocar = "numero" | "logradouro";

// Preenche com o que o CEP trouxe (os campos seguem editáveis). O foco vai para Número;
// CEP geral de cidade vem sem rua, então o foco vai para Logradouro.
export function preencherComCep(
  campos: CamposEndereco,
  encontrado: EnderecoCep,
): { campos: CamposEndereco; focarEm: CampoParaFocar } {
  return {
    campos: {
      ...campos,
      logradouro: encontrado.logradouro,
      bairro: encontrado.bairro,
      cidade: encontrado.cidade,
      uf: encontrado.uf,
    },
    focarEm: encontrado.logradouro === "" ? "logradouro" : "numero",
  };
}

function textoOuNull(valor: string): string | null {
  const aparado = valor.trim();
  return aparado === "" ? null : aparado;
}

// Endereço pronto para o pedido, ou null enquanto falta algo obrigatório. A validação
// completa (UF existente, tamanhos) é do backend.
export function enderecoNovoDoFormulario(
  campos: CamposEndereco,
): EnderecoNovoPayload | null {
  const cep = somenteDigitos(campos.cep);
  const obrigatorios = [
    campos.logradouro,
    campos.numero,
    campos.bairro,
    campos.cidade,
  ].map((valor) => valor.trim());
  const uf = campos.uf.trim().toUpperCase();

  if (
    cep.length !== DIGITOS_CEP ||
    obrigatorios.includes("") ||
    !/^[A-Z]{2}$/.test(uf)
  ) {
    return null;
  }

  const [logradouro, numero, bairro, cidade] = obrigatorios;

  return {
    cep,
    logradouro,
    numero,
    complemento: textoOuNull(campos.complemento),
    bairro,
    cidade,
    uf,
    referencia: textoOuNull(campos.referencia),
  };
}

export interface Localidade {
  cidade: string;
  bairro: string;
}

// Cidade e bairro que definem o frete: do endereço salvo escolhido ou do endereço novo.
export function localidadeDaEntrega(
  cliente: Cliente | null,
  escolha: EscolhaEndereco,
  camposNovo: CamposEndereco,
): Localidade | null {
  const origem =
    escolha === "novo"
      ? camposNovo
      : (cliente?.enderecos.find((endereco) => endereco.id === escolha) ??
        null);

  if (origem === null) {
    return null;
  }

  const cidade = origem.cidade.trim();
  const bairro = origem.bairro.trim();

  return cidade === "" || bairro === "" ? null : { cidade, bairro };
}
