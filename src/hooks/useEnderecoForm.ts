import { type RefObject, useRef, useState } from "react";
import type { StatusCepLookup } from "../lib/cep-lookup";
import {
  CAMPOS_ENDERECO_VAZIOS,
  type CamposEndereco,
  enderecoNovoDoFormulario,
  preencherComCep,
} from "../lib/endereco-entrega";
import { mascararCep, somenteDigitos } from "../lib/mascaras";
import type { EnderecoNovoPayload } from "../services/delivery.service";
import { useCepLookup } from "./useCepLookup";

export interface ControleEnderecoForm {
  campos: CamposEndereco;
  alterar: (campo: keyof CamposEndereco, valor: string) => void;
  statusCep: StatusCepLookup;
  // null enquanto falta algo obrigatório.
  endereco: EnderecoNovoPayload | null;
  cepRef: RefObject<HTMLInputElement | null>;
  numeroRef: RefObject<HTMLInputElement | null>;
  logradouroRef: RefObject<HTMLInputElement | null>;
  limpar: () => void;
}

// Formulário de endereço com busca do CEP no ViaCEP (PED-108), usado no novo pedido
// delivery e no cadastro de clientes (PED-124). Na edição, o CEP salvo não é consultado
// de novo: só um CEP alterado preenche os campos, para não sobrescrever o que foi gravado.
export function useEnderecoForm(
  inicial: CamposEndereco = CAMPOS_ENDERECO_VAZIOS,
): ControleEnderecoForm {
  const [campos, setCampos] = useState<CamposEndereco>(inicial);
  const [cepInicial] = useState(() => somenteDigitos(inicial.cep));
  const cepRef = useRef<HTMLInputElement>(null);
  const numeroRef = useRef<HTMLInputElement>(null);
  const logradouroRef = useRef<HTMLInputElement>(null);

  const cepAlterado =
    cepInicial === "" || somenteDigitos(campos.cep) !== cepInicial;

  const { status: statusCep } = useCepLookup(
    cepAlterado ? campos.cep : "",
    (encontrado) => {
      const { campos: preenchidos, focarEm } = preencherComCep(
        campos,
        encontrado,
      );
      setCampos(preenchidos);
      (focarEm === "numero" ? numeroRef : logradouroRef).current?.focus();
    },
  );

  return {
    campos,
    alterar: (campo, valor) =>
      setCampos((atuais) => ({
        ...atuais,
        [campo]: campo === "cep" ? mascararCep(valor) : valor,
      })),
    statusCep,
    endereco: enderecoNovoDoFormulario(campos),
    cepRef,
    numeroRef,
    logradouroRef,
    limpar: () => setCampos(CAMPOS_ENDERECO_VAZIOS),
  };
}
