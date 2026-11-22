import { type RefObject, useRef, useState } from "react";
import { useCepLookup } from "../../../hooks/useCepLookup";
import type { StatusCepLookup } from "../../../lib/cep-lookup";
import {
  CAMPOS_ENDERECO_VAZIOS,
  type CamposEndereco,
  enderecoNovoDoFormulario,
  preencherComCep,
} from "../../../lib/endereco-entrega";
import { mascararCep } from "../../../lib/mascaras";
import type { EnderecoNovoPayload } from "../../../services/delivery.service";

export interface ControleEnderecoNovo {
  campos: CamposEndereco;
  alterar: (campo: keyof CamposEndereco, valor: string) => void;
  statusCep: StatusCepLookup;
  salvarNoCadastro: boolean;
  alterarSalvarNoCadastro: (salvar: boolean) => void;
  // null enquanto falta algo obrigatório.
  endereco: EnderecoNovoPayload | null;
  cepRef: RefObject<HTMLInputElement | null>;
  numeroRef: RefObject<HTMLInputElement | null>;
  logradouroRef: RefObject<HTMLInputElement | null>;
  limpar: () => void;
}

// Formulário de endereço novo do delivery (PED-108). `clienteNovo` define o padrão de
// "Salvar endereço no cadastro": marcado para cliente novo.
export function useEnderecoNovo(clienteNovo: boolean): ControleEnderecoNovo {
  const [campos, setCampos] = useState<CamposEndereco>(CAMPOS_ENDERECO_VAZIOS);
  // null = segue o padrão (cliente novo); boolean = o atendente mexeu no checkbox.
  const [salvarEscolhido, setSalvarEscolhido] = useState<boolean | null>(null);
  const cepRef = useRef<HTMLInputElement>(null);
  const numeroRef = useRef<HTMLInputElement>(null);
  const logradouroRef = useRef<HTMLInputElement>(null);

  const { status: statusCep } = useCepLookup(campos.cep, (encontrado) => {
    const { campos: preenchidos, focarEm } = preencherComCep(
      campos,
      encontrado,
    );
    setCampos(preenchidos);
    (focarEm === "numero" ? numeroRef : logradouroRef).current?.focus();
  });

  return {
    campos,
    alterar: (campo, valor) =>
      setCampos((atuais) => ({
        ...atuais,
        [campo]: campo === "cep" ? mascararCep(valor) : valor,
      })),
    statusCep,
    salvarNoCadastro: salvarEscolhido ?? clienteNovo,
    alterarSalvarNoCadastro: setSalvarEscolhido,
    endereco: enderecoNovoDoFormulario(campos),
    cepRef,
    numeroRef,
    logradouroRef,
    limpar: () => {
      setCampos(CAMPOS_ENDERECO_VAZIOS);
      setSalvarEscolhido(null);
    },
  };
}
