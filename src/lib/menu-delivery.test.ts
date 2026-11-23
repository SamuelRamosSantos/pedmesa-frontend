import { describe, expect, it } from "vitest";
import {
  entraEmTrocarVisao,
  ITENS_MENU_DELIVERY,
  itensMenuDelivery,
} from "./menu-delivery";

describe("itensMenuDelivery", () => {
  it("admin e expedição veem Novo pedido, Expedição e Clientes", () => {
    expect(itensMenuDelivery(["expedicao"], true)).toBe(ITENS_MENU_DELIVERY);
    expect(itensMenuDelivery(["admin", "caixa"], true)).toBe(
      ITENS_MENU_DELIVERY,
    );
    expect(ITENS_MENU_DELIVERY.map((item) => item.label)).toEqual([
      "Novo pedido",
      "Expedição",
      "Clientes",
    ]);
  });

  it("outros papéis não veem a seção", () => {
    expect(itensMenuDelivery(["caixa", "garcom", "cozinha"], true)).toEqual([]);
  });

  it("some com o delivery desativado ou enquanto a configuração carrega", () => {
    expect(itensMenuDelivery(["admin"], false)).toEqual([]);
    expect(itensMenuDelivery(["expedicao"], null)).toEqual([]);
  });
});

describe("entraEmTrocarVisao", () => {
  it("a expedição sai de Trocar visão; as outras visões ficam", () => {
    expect(entraEmTrocarVisao("expedicao")).toBe(false);
    expect(entraEmTrocarVisao("caixa")).toBe(true);
    expect(entraEmTrocarVisao("admin")).toBe(true);
  });
});
