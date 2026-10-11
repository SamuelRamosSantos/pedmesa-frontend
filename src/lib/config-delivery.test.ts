import { describe, expect, it } from "vitest";
import { formConfigDelivery, payloadConfigDelivery } from "./config-delivery";

describe("configuração do delivery", () => {
  it("taxa padrão null = não atende fora da lista", () => {
    expect(formConfigDelivery({ delivery_ativo: true, taxa_entrega_padrao: null, pedido_minimo_delivery: 30 })).toEqual({
      ativo: true,
      atendeForaDaLista: false,
      taxaPadraoCents: 0,
      pedidoMinimoCents: 3000,
    });
  });

  it("converte reais para centavos sem erro de ponto flutuante", () => {
    expect(formConfigDelivery({ delivery_ativo: false, taxa_entrega_padrao: 8.7, pedido_minimo_delivery: 0.29 })).toMatchObject({
      atendeForaDaLista: true,
      taxaPadraoCents: 870,
      pedidoMinimoCents: 29,
    });
  });

  it("payload: desligar 'fora da lista' manda null mesmo com valor digitado", () => {
    expect(payloadConfigDelivery({ ativo: true, atendeForaDaLista: false, taxaPadraoCents: 990, pedidoMinimoCents: 2550 })).toEqual({
      delivery_ativo: true,
      taxa_entrega_padrao: null,
      pedido_minimo_delivery: 25.5,
    });
  });

  it("payload: taxa padrão zero é entrega grátis fora da lista", () => {
    expect(payloadConfigDelivery({ ativo: true, atendeForaDaLista: true, taxaPadraoCents: 0, pedidoMinimoCents: 0 })).toEqual({
      delivery_ativo: true,
      taxa_entrega_padrao: 0,
      pedido_minimo_delivery: 0,
    });
  });
});
