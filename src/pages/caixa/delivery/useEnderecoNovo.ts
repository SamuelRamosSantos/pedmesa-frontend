import { useState } from "react";
import {
  type ControleEnderecoForm,
  useEnderecoForm,
} from "../../../hooks/useEnderecoForm";

export interface ControleEnderecoNovo extends ControleEnderecoForm {
  salvarNoCadastro: boolean;
  alterarSalvarNoCadastro: (salvar: boolean) => void;
}

// Endereço novo do pedido delivery (PED-108): o formulário compartilhado mais o
// "Salvar endereço no cadastro", marcado por padrão para cliente novo.
export function useEnderecoNovo(clienteNovo: boolean): ControleEnderecoNovo {
  const formulario = useEnderecoForm();
  // null = segue o padrão (cliente novo); boolean = o atendente mexeu no checkbox.
  const [salvarEscolhido, setSalvarEscolhido] = useState<boolean | null>(null);

  return {
    ...formulario,
    salvarNoCadastro: salvarEscolhido ?? clienteNovo,
    alterarSalvarNoCadastro: setSalvarEscolhido,
    limpar: () => {
      formulario.limpar();
      setSalvarEscolhido(null);
    },
  };
}
