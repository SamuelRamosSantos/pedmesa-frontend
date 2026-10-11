import { describe, expect, it } from "vitest";
import { mascararCep, mascararTelefone, somenteDigitos } from "./mascaras";

describe("somenteDigitos", () => {
  it("remove tudo que não é dígito", () => {
    expect(somenteDigitos("+55 (11) 98765-4321")).toBe("5511987654321");
    expect(somenteDigitos("abc")).toBe("");
  });
});

describe("mascararTelefone", () => {
  it.each([
    ["", ""],
    ["1", "(1"],
    ["11", "(11"],
    ["113", "(11) 3"],
    ["113456", "(11) 3456"],
    ["1134567", "(11) 3456-7"],
    ["1134567890", "(11) 3456-7890"],
    ["11987654321", "(11) 98765-4321"],
  ])("formata enquanto digita: %s -> %s", (digitado, esperado) => {
    expect(mascararTelefone(digitado)).toBe(esperado);
  });

  it("reformata texto já mascarado (apagar e colar não duplicam símbolos)", () => {
    expect(mascararTelefone("(11) 98765-432")).toBe("(11) 9876-5432");
    expect(mascararTelefone("(11) 98765-4321")).toBe("(11) 98765-4321");
  });

  it("ignora dígitos além do 11º", () => {
    expect(mascararTelefone("119876543219")).toBe("(11) 98765-4321");
  });

  it("aceita colar com +55 ou com zero de operadora, como o backend", () => {
    expect(mascararTelefone("+55 11 98765-4321")).toBe("(11) 98765-4321");
    expect(mascararTelefone("+55 11 3456-7890")).toBe("(11) 3456-7890");
    expect(mascararTelefone("(011) 98765-4321")).toBe("(11) 98765-4321");
  });

  it("não corta o DDD 55", () => {
    expect(mascararTelefone("55999998888")).toBe("(55) 99999-8888");
  });
});

describe("mascararCep", () => {
  it.each([
    ["", ""],
    ["013", "013"],
    ["01310", "01310"],
    ["013101", "01310-1"],
    ["01310100", "01310-100"],
    ["01.310-100", "01310-100"],
    ["013101009", "01310-100"],
  ])("%s -> %s", (digitado, esperado) => {
    expect(mascararCep(digitado)).toBe(esperado);
  });
});
