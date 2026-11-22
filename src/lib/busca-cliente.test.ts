import { describe, expect, it } from "vitest";
import type { Cliente } from "../types/cliente";
import {
  cadastroAPartirDaBusca,
  classificarBusca,
  clienteDoTelefone,
  formatarTermoDigitado,
  pendenciaDoCadastro,
  situacaoDaBusca,
  termoParaConsulta,
} from "./busca-cliente";

const MARIA: Cliente = {
  id: "c1",
  nome: "Maria Souza",
  telefone: "11987654321",
  observacoes: null,
  ativo: true,
  criado_em: "2026-10-11T12:00:00.000Z",
  atualizado_em: "2026-10-11T12:00:00.000Z",
  enderecos: [],
};

describe("classificarBusca", () => {
  it("vazia e curta não buscam", () => {
    expect(classificarBusca("  ")).toEqual({ tipo: "vazia" });
    expect(classificarBusca("M")).toEqual({ tipo: "curta" });
    expect(classificarBusca("(11")).toEqual({ tipo: "curta" });
  });

  it("telefone com máscara, completo ou não", () => {
    expect(classificarBusca("(11) 98765-4321")).toEqual({
      tipo: "telefone",
      digitos: "11987654321",
      completo: true,
    });
    expect(classificarBusca("(11) 9876")).toEqual({
      tipo: "telefone",
      digitos: "119876",
      completo: false,
    });
  });

  it("tira o +55 como o backend", () => {
    expect(classificarBusca("+55 11 98765-4321")).toMatchObject({
      digitos: "11987654321",
      completo: true,
    });
  });

  it("com letras é nome, com espaços normalizados", () => {
    expect(classificarBusca("  Maria   Souza ")).toEqual({
      tipo: "nome",
      texto: "Maria Souza",
    });
  });
});

describe("termoParaConsulta", () => {
  it("telefone vai só com dígitos; nome como digitado; o resto não consulta", () => {
    expect(termoParaConsulta(classificarBusca("(11) 9876"))).toBe("119876");
    expect(termoParaConsulta(classificarBusca("Maria"))).toBe("Maria");
    expect(termoParaConsulta(classificarBusca("M"))).toBeNull();
  });
});

describe("formatarTermoDigitado", () => {
  it("mascara só o que parece telefone", () => {
    expect(formatarTermoDigitado("11987")).toBe("(11) 987");
    expect(formatarTermoDigitado("Maria 2")).toBe("Maria 2");
    expect(formatarTermoDigitado("")).toBe("");
  });
});

describe("clienteDoTelefone", () => {
  it("acha só o telefone exato", () => {
    expect(clienteDoTelefone([MARIA], "11987654321")).toBe(MARIA);
    expect(clienteDoTelefone([MARIA], "1198765432")).toBeNull();
  });
});

describe("cadastroAPartirDaBusca", () => {
  it("leva o telefone (mascarado) ou o nome buscado", () => {
    expect(cadastroAPartirDaBusca(classificarBusca("11987654321"))).toEqual({
      nome: "",
      telefone: "(11) 98765-4321",
    });
    expect(cadastroAPartirDaBusca(classificarBusca("João"))).toEqual({
      nome: "João",
      telefone: "",
    });
  });
});

describe("pendenciaDoCadastro", () => {
  it.each([
    [{ nome: "", telefone: "" }, "Informe o nome e o telefone do cliente."],
    [{ nome: " ", telefone: "(11) 98765-4321" }, "Informe o nome do cliente."],
    [{ nome: "João", telefone: "(11) 9876" }, "Informe o telefone com DDD."],
    [{ nome: "João", telefone: "(11) 98765-4321" }, null],
  ])("%j → %s", (campos, esperado) => {
    expect(pendenciaDoCadastro(campos)).toBe(esperado);
  });
});

describe("situacaoDaBusca", () => {
  const nome = classificarBusca("Maria");

  it("sem termo suficiente não busca", () => {
    const idle = { status: "idle" as const, valor: null };
    expect(situacaoDaBusca(classificarBusca(""), idle, false)).toBe("vazia");
    expect(situacaoDaBusca(classificarBusca("M"), idle, false)).toBe("curta");
  });

  it("buscando enquanto digita ou carrega", () => {
    const concluida = { status: "concluida" as const, valor: { clientes: [] } };
    expect(situacaoDaBusca(nome, concluida, true)).toBe("buscando");
    expect(
      situacaoDaBusca(nome, { status: "carregando", valor: null }, false),
    ).toBe("buscando");
  });

  it("resultados, nenhum resultado ou falha", () => {
    expect(
      situacaoDaBusca(
        nome,
        { status: "concluida", valor: { clientes: [MARIA] } },
        false,
      ),
    ).toBe("resultados");
    expect(
      situacaoDaBusca(
        nome,
        { status: "concluida", valor: { clientes: [] } },
        false,
      ),
    ).toBe("sem_resultado");
    expect(
      situacaoDaBusca(nome, { status: "falhou", valor: null }, false),
    ).toBe("falhou");
  });
});
