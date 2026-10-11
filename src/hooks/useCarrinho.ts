import { useState } from "react";
import { adicionarProduto, alterarItem, quantidadeTotal, removerItem, totalEstimado } from "../lib/carrinho";
import type { AlteracaoItemCarrinho, ItemCarrinho } from "../types/carrinho";
import type { Produto } from "../types/produto";

export interface ControleCarrinho {
  itens: ItemCarrinho[];
  adicionar: (produto: Produto) => void;
  alterar: (id: string, alteracao: AlteracaoItemCarrinho) => void;
  remover: (id: string) => void;
  limpar: () => void;
  quantidadeTotal: number;
  // Só para exibição; o valor cobrado vem do backend.
  totalEstimado: number;
}

// Carrinho compartilhado entre a comanda do garçom e o novo pedido delivery (PED-109).
export function useCarrinho(): ControleCarrinho {
  const [itens, setItens] = useState<ItemCarrinho[]>([]);

  return {
    itens,
    adicionar: (produto) => setItens((atuais) => adicionarProduto(atuais, produto, crypto.randomUUID())),
    alterar: (id, alteracao) => setItens((atuais) => alterarItem(atuais, id, alteracao)),
    remover: (id) => setItens((atuais) => removerItem(atuais, id)),
    limpar: () => setItens([]),
    quantidadeTotal: quantidadeTotal(itens),
    totalEstimado: totalEstimado(itens),
  };
}
