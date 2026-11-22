import { describe, expect, it } from "vitest";
import type { TaxaEntrega } from "../types/delivery";
import { formDaTaxa, listarTaxas, validarFormTaxa } from "./taxas-entrega";

function taxa(
  id: string,
  cidade: string,
  bairro: string,
  alteracao: Partial<TaxaEntrega> = {},
): TaxaEntrega {
  return {
    id,
    cidade,
    bairro,
    valor: 5,
    tempo_estimado_min: 30,
    ativo: true,
    ...alteracao,
  };
}

describe("formDaTaxa", () => {
  it("nova taxa começa com a cidade do estabelecimento", () => {
    expect(formDaTaxa(null, "São Paulo")).toEqual({
      cidade: "São Paulo",
      bairro: "",
      valorCents: 0,
      tempoEstimado: "",
    });
  });

  it("cadastro pelo novo pedido já vem com o bairro e a cidade do endereço (PED-125)", () => {
    expect(formDaTaxa(null, "Frei Inocêncio", "Independência")).toMatchObject({
      cidade: "Frei Inocêncio",
      bairro: "Independência",
    });
  });

  it("edição carrega os valores (sem erro de ponto flutuante)", () => {
    expect(
      formDaTaxa(
        taxa("1", "São Paulo", "Bela Vista", {
          valor: 8.7,
          tempo_estimado_min: null,
        }),
        "",
      ),
    ).toEqual({
      cidade: "São Paulo",
      bairro: "Bela Vista",
      valorCents: 870,
      tempoEstimado: "",
    });
  });
});

describe("validarFormTaxa", () => {
  it("monta o payload em reais; tempo vazio vira null", () => {
    expect(
      validarFormTaxa({
        cidade: " São Paulo ",
        bairro: " Pinheiros ",
        valorCents: 1050,
        tempoEstimado: "",
      }),
    ).toEqual({
      ok: true,
      payload: {
        cidade: "São Paulo",
        bairro: "Pinheiros",
        valor: 10.5,
        tempo_estimado_min: null,
      },
    });
  });

  it("frete grátis (valor zero) é válido", () => {
    expect(
      validarFormTaxa({
        cidade: "SP",
        bairro: "Centro",
        valorCents: 0,
        tempoEstimado: "45",
      }),
    ).toMatchObject({
      ok: true,
      payload: { valor: 0, tempo_estimado_min: 45 },
    });
  });

  it("aponta cada campo inválido", () => {
    expect(
      validarFormTaxa({
        cidade: " ",
        bairro: "",
        valorCents: 0,
        tempoEstimado: "2,5",
      }),
    ).toEqual({
      ok: false,
      erros: {
        cidade: "Informe a cidade.",
        bairro: "Informe o bairro.",
        tempoEstimado:
          "Informe minutos inteiros entre 1 e 1440, ou deixe vazio.",
      },
    });
    expect(
      validarFormTaxa({
        cidade: "SP",
        bairro: "A",
        valorCents: 0,
        tempoEstimado: "1441",
      }).ok,
    ).toBe(false);
  });
});

describe("listarTaxas", () => {
  const TAXAS = [
    taxa("1", "São Paulo", "Vila Mariana"),
    taxa("2", "Campinas", "Centro"),
    taxa("3", "São Paulo", "Bela Vista"),
  ];

  it("ordena por cidade e bairro", () => {
    expect(listarTaxas(TAXAS, "").map((t) => t.id)).toEqual(["2", "3", "1"]);
  });

  it("busca sem acento e sem diferenciar maiúsculas, por bairro ou cidade", () => {
    expect(listarTaxas(TAXAS, "sao paulo").map((t) => t.id)).toEqual([
      "3",
      "1",
    ]);
    expect(listarTaxas(TAXAS, "MARIANA").map((t) => t.id)).toEqual(["1"]);
  });
});
