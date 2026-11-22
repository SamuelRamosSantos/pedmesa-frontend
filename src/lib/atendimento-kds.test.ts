import { describe, expect, it } from "vitest";
import { identificacaoNoKds } from "./atendimento-kds";

describe("identificacaoNoKds", () => {
  it("mesa mostra o número da comanda", () => {
    expect(
      identificacaoNoKds({
        tipo_atendimento: "mesa",
        numero_comanda: 12,
        numero_entrega: null,
      }),
    ).toEqual({ delivery: false, rotulo: "Mesa", numero: "12" });
  });

  it("delivery mostra o número da entrega como no cupom", () => {
    expect(
      identificacaoNoKds({
        tipo_atendimento: "delivery",
        numero_comanda: null,
        numero_entrega: 7,
      }),
    ).toEqual({ delivery: true, rotulo: "Delivery", numero: "#0007" });
  });

  it("número ausente não quebra o cartão", () => {
    expect(
      identificacaoNoKds({
        tipo_atendimento: "delivery",
        numero_comanda: null,
        numero_entrega: null,
      }).numero,
    ).toBe("—");
  });
});
