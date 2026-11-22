import { describe, expect, it } from "vitest";
import { estadoDoCepLookup } from "./cep-lookup";

const ENDERECO = {
  logradouro: "Avenida Paulista",
  bairro: "Bela Vista",
  cidade: "São Paulo",
  uf: "SP",
};

describe("estadoDoCepLookup", () => {
  it("repassa idle, carregando e falhou sem endereço", () => {
    expect(estadoDoCepLookup({ status: "idle", valor: null })).toEqual({
      status: "idle",
      endereco: null,
    });
    expect(estadoDoCepLookup({ status: "carregando", valor: null })).toEqual({
      status: "carregando",
      endereco: null,
    });
    expect(estadoDoCepLookup({ status: "falhou", valor: null })).toEqual({
      status: "falhou",
      endereco: null,
    });
  });

  it("concluída com endereço é encontrado", () => {
    expect(estadoDoCepLookup({ status: "concluida", valor: ENDERECO })).toEqual(
      { status: "encontrado", endereco: ENDERECO },
    );
  });

  it("concluída sem endereço é CEP inexistente", () => {
    expect(estadoDoCepLookup({ status: "concluida", valor: null })).toEqual({
      status: "nao_encontrado",
      endereco: null,
    });
  });
});
