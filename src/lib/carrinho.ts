import type { ItemPedidoDeliveryPayload } from "../services/delivery.service";
import type { CreatePedidoItemPayload } from "../services/pedido.service";
import type { AlteracaoItemCarrinho, ItemCarrinho } from "../types/carrinho";
import type { Produto } from "../types/produto";

// Regras do carrinho (PED-109), as mesmas para a mesa e para o delivery.

// Cada clique vira uma linha nova: itens iguais podem ter observação ou integrante diferentes.
export function adicionarProduto(
  itens: readonly ItemCarrinho[],
  produto: Produto,
  id: string,
): ItemCarrinho[] {
  return [
    ...itens,
    {
      id,
      produtoId: produto.id,
      produtoNome: produto.nome,
      precoUnitario: produto.preco,
      quantidade: 1,
      integranteId: null,
      observacao: "",
    },
  ];
}

export function alterarItem(
  itens: readonly ItemCarrinho[],
  id: string,
  alteracao: AlteracaoItemCarrinho,
): ItemCarrinho[] {
  return itens.map((item) =>
    item.id !== id
      ? item
      : {
          ...item,
          ...alteracao,
          quantidade: Math.max(1, alteracao.quantidade ?? item.quantidade),
        },
  );
}

export function removerItem(
  itens: readonly ItemCarrinho[],
  id: string,
): ItemCarrinho[] {
  return itens.filter((item) => item.id !== id);
}

export function quantidadeTotal(itens: readonly ItemCarrinho[]): number {
  return itens.reduce((soma, item) => soma + item.quantidade, 0);
}

// Estimativa para exibir no carrinho (em centavos, sem erro de ponto flutuante). O valor
// cobrado vem do backend.
export function totalEstimado(itens: readonly ItemCarrinho[]): number {
  return (
    itens.reduce(
      (soma, item) =>
        soma + Math.round(item.precoUnitario * 100) * item.quantidade,
      0,
    ) / 100
  );
}

function observacaoOuNull(observacao: string): string | null {
  return observacao.trim() || null;
}

export function itensParaPedidoMesa(
  itens: readonly ItemCarrinho[],
): CreatePedidoItemPayload[] {
  return itens.map((item) => ({
    produto_id: item.produtoId,
    integrante_id: item.integranteId,
    quantidade: item.quantidade,
    observacao: observacaoOuNull(item.observacao),
  }));
}

// Para a cotação só importam produto e quantidade: a observação fica de fora para não
// cotar de novo a cada letra digitada nela.
export function itensParaCotacao(
  itens: readonly ItemCarrinho[],
): ItemPedidoDeliveryPayload[] {
  return itens.map((item) => ({
    produto_id: item.produtoId,
    quantidade: item.quantidade,
  }));
}

// Delivery não tem integrante: os itens são do cliente.
export function itensParaPedidoDelivery(
  itens: readonly ItemCarrinho[],
): ItemPedidoDeliveryPayload[] {
  return itens.map((item) => ({
    produto_id: item.produtoId,
    quantidade: item.quantidade,
    observacao: observacaoOuNull(item.observacao),
  }));
}
