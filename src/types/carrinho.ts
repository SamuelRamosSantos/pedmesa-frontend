// Item do carrinho antes de enviar o pedido, compartilhado entre garçom e delivery
// (PED-109). O preço é só para exibição: o valor cobrado é calculado no backend.
export interface ItemCarrinho {
  id: string;
  produtoId: string;
  produtoNome: string;
  precoUnitario: number;
  quantidade: number;
  // Só na mesa (para quem é o item); no delivery fica sempre null.
  integranteId: string | null;
  observacao: string;
}

export type AlteracaoItemCarrinho = Partial<
  Pick<ItemCarrinho, "quantidade" | "integranteId" | "observacao">
>;
