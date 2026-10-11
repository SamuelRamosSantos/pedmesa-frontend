import { describe, expect, it } from "vitest";
import { mapearRespostaViaCep } from "./via-cep";

describe("mapearRespostaViaCep", () => {
  it("resposta completa: mapeia localidade para cidade", () => {
    const resposta = {
      cep: "01310-100",
      logradouro: "Avenida Paulista",
      complemento: "de 612 a 1510 - lado par",
      unidade: "",
      bairro: "Bela Vista",
      localidade: "São Paulo",
      uf: "SP",
      estado: "São Paulo",
      ibge: "3550308",
      ddd: "11",
    };

    expect(mapearRespostaViaCep(resposta)).toEqual({
      logradouro: "Avenida Paulista",
      bairro: "Bela Vista",
      cidade: "São Paulo",
      uf: "SP",
    });
  });

  it("resposta parcial (CEP geral de cidade): logradouro e bairro vazios", () => {
    const resposta = { cep: "13990-000", logradouro: "", bairro: "", localidade: "Espírito Santo do Pinhal", uf: "SP" };

    expect(mapearRespostaViaCep(resposta)).toEqual({
      logradouro: "",
      bairro: "",
      cidade: "Espírito Santo do Pinhal",
      uf: "SP",
    });
  });

  it("campos ausentes ou de outro tipo viram vazio; textos são aparados", () => {
    expect(mapearRespostaViaCep({ localidade: " Recife ", uf: "pe", bairro: 42 })).toEqual({
      logradouro: "",
      bairro: "",
      cidade: "Recife",
      uf: "PE",
    });
  });

  it.each([
    ["erro booleano", { erro: true }],
    ["erro em texto (versões antigas)", { erro: "true" }],
  ])("CEP inexistente (%s) vira null", (_caso, resposta) => {
    expect(mapearRespostaViaCep(resposta)).toBeNull();
  });

  it.each([
    ["null", null],
    ["texto", "<html>"],
    ["sem cidade", { logradouro: "Rua A", uf: "SP" }],
    ["sem UF", { logradouro: "Rua A", localidade: "São Paulo" }],
  ])("resposta inválida (%s) vira null", (_caso, resposta) => {
    expect(mapearRespostaViaCep(resposta)).toBeNull();
  });
});
