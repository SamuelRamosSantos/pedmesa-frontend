import { describe, expect, it } from "vitest";
import { estadoDoCepLookup, type ResultadoCepLookup } from "./cep-lookup";

const ENDERECO = { logradouro: "Avenida Paulista", bairro: "Bela Vista", cidade: "São Paulo", uf: "SP" };
const ENCONTRADO: ResultadoCepLookup = { cep: "01310100", status: "encontrado", endereco: ENDERECO };

describe("estadoDoCepLookup", () => {
  it("idle enquanto não há 8 dígitos, mesmo com resultado anterior", () => {
    expect(estadoDoCepLookup("", null)).toEqual({ status: "idle", endereco: null });
    expect(estadoDoCepLookup("0131010", ENCONTRADO)).toEqual({ status: "idle", endereco: null });
  });

  it("carregando enquanto o CEP atual não respondeu", () => {
    expect(estadoDoCepLookup("01310100", null)).toEqual({ status: "carregando", endereco: null });
  });

  it("ignora resposta de outro CEP (digitou de novo)", () => {
    expect(estadoDoCepLookup("04101000", ENCONTRADO)).toEqual({ status: "carregando", endereco: null });
  });

  it("mostra o resultado do CEP atual", () => {
    expect(estadoDoCepLookup("01310100", ENCONTRADO)).toEqual({ status: "encontrado", endereco: ENDERECO });
    expect(estadoDoCepLookup("99999999", { cep: "99999999", status: "nao_encontrado", endereco: null })).toEqual({
      status: "nao_encontrado",
      endereco: null,
    });
    expect(estadoDoCepLookup("01310100", { cep: "01310100", status: "falhou", endereco: null }).status).toBe("falhou");
  });
});
