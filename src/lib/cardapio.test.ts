import { describe, expect, it } from "vitest";
import type { Produto } from "../types/produto";
import { filtrarProdutos, primeiroDisponivel } from "./cardapio";

function produto(id: string, nome: string, categoriaId: string, disponivel = true): Produto {
  return { id, categoria_id: categoriaId, nome, preco: 10, descricao: null, disponivel, precisa_preparo: true };
}

const PRODUTOS = [
  produto("1", "X-Salada", "lanches"),
  produto("2", "Refrigerante", "bebidas"),
  produto("3", "X-Burger", "lanches", false),
  produto("4", "Água", "bebidas"),
];

describe("filtrarProdutos", () => {
  it("sem filtro: todos em ordem alfabética", () => {
    expect(filtrarProdutos(PRODUTOS, null, "").map((p) => p.nome)).toEqual(["Água", "Refrigerante", "X-Burger", "X-Salada"]);
  });

  it("por categoria e por nome, sem diferenciar maiúsculas", () => {
    expect(filtrarProdutos(PRODUTOS, "bebidas", "").map((p) => p.id)).toEqual(["4", "2"]);
    expect(filtrarProdutos(PRODUTOS, null, "  x-B ").map((p) => p.id)).toEqual(["3"]);
    expect(filtrarProdutos(PRODUTOS, "lanches", "x").map((p) => p.id)).toEqual(["3", "1"]);
  });
});

describe("primeiroDisponivel", () => {
  it("pula o esgotado", () => {
    expect(primeiroDisponivel(filtrarProdutos(PRODUTOS, "lanches", "x"))?.id).toBe("1");
  });

  it("null quando nada está disponível", () => {
    expect(primeiroDisponivel([produto("3", "X-Burger", "lanches", false)])).toBeNull();
    expect(primeiroDisponivel([])).toBeNull();
  });
});
