import { describe, expect, it } from "vitest";
import type { ItemCarrinho } from "../types/carrinho";
import type { Produto } from "../types/produto";
import {
  adicionarProduto,
  alterarItem,
  itensParaCotacao,
  itensParaPedidoDelivery,
  itensParaPedidoMesa,
  quantidadeTotal,
  removerItem,
  totalEstimado,
} from "./carrinho";

const PRODUTO: Produto = {
  id: "p1",
  categoria_id: "c1",
  nome: "X-Burger",
  preco: 19.9,
  descricao: null,
  disponivel: true,
  precisa_preparo: true,
};

const ITEM: ItemCarrinho = {
  id: "i1",
  produtoId: "p1",
  produtoNome: "X-Burger",
  precoUnitario: 19.9,
  quantidade: 2,
  integranteId: "int1",
  observacao: "  sem cebola ",
};

describe("carrinho", () => {
  it("adicionar cria uma linha nova com quantidade 1", () => {
    const itens = adicionarProduto(adicionarProduto([], PRODUTO, "a"), PRODUTO, "b");
    expect(itens).toHaveLength(2);
    expect(itens[1]).toEqual({
      id: "b",
      produtoId: "p1",
      produtoNome: "X-Burger",
      precoUnitario: 19.9,
      quantidade: 1,
      integranteId: null,
      observacao: "",
    });
  });

  it("alterar muda só o item indicado e nunca deixa quantidade abaixo de 1", () => {
    const itens = [ITEM, { ...ITEM, id: "i2" }];
    expect(alterarItem(itens, "i1", { quantidade: 5 }).map((item) => item.quantidade)).toEqual([5, 2]);
    expect(alterarItem(itens, "i1", { quantidade: 0 })[0].quantidade).toBe(1);
    expect(alterarItem(itens, "i2", { observacao: "bem passado" })[1].observacao).toBe("bem passado");
  });

  it("remover", () => {
    expect(removerItem([ITEM, { ...ITEM, id: "i2" }], "i1").map((item) => item.id)).toEqual(["i2"]);
  });

  it("quantidade total e total estimado sem erro de ponto flutuante", () => {
    const itens = [ITEM, { ...ITEM, id: "i2", precoUnitario: 0.1, quantidade: 3 }];
    expect(quantidadeTotal(itens)).toBe(5);
    expect(totalEstimado(itens)).toBe(40.1);
  });

  it("payload da mesa leva integrante; observação vazia vira null", () => {
    expect(itensParaPedidoMesa([ITEM, { ...ITEM, observacao: " " }])).toEqual([
      { produto_id: "p1", integrante_id: "int1", quantidade: 2, observacao: "sem cebola" },
      { produto_id: "p1", integrante_id: "int1", quantidade: 2, observacao: null },
    ]);
  });

  it("cotação leva só produto e quantidade", () => {
    expect(itensParaCotacao([ITEM])).toEqual([{ produto_id: "p1", quantidade: 2 }]);
  });

  it("payload do delivery não leva integrante", () => {
    expect(itensParaPedidoDelivery([ITEM])).toEqual([{ produto_id: "p1", quantidade: 2, observacao: "sem cebola" }]);
  });
});
