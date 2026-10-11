import { describe, expect, it } from "vitest";
import { estadoDaConsulta, type ResultadoConsulta } from "./consulta-por-chave";

const CONCLUIDA: ResultadoConsulta<string> = { chave: "a", status: "concluida", valor: "valor de a" };

describe("estadoDaConsulta", () => {
  it("idle sem chave, mesmo com resultado anterior", () => {
    expect(estadoDaConsulta(null, CONCLUIDA)).toEqual({ status: "idle", valor: null });
  });

  it("carregando enquanto a chave atual não respondeu", () => {
    expect(estadoDaConsulta("a", null)).toEqual({ status: "carregando", valor: null });
  });

  it("ignora o resultado de outra chave", () => {
    expect(estadoDaConsulta("b", CONCLUIDA)).toEqual({ status: "carregando", valor: null });
  });

  it("mostra o resultado da chave atual", () => {
    expect(estadoDaConsulta("a", CONCLUIDA)).toEqual({ status: "concluida", valor: "valor de a" });
    expect(estadoDaConsulta("a", { chave: "a", status: "falhou", valor: null })).toEqual({ status: "falhou", valor: null });
  });
});
