import { describe, expect, it } from "vitest";
import type { Cliente } from "../types/cliente";
import {
  formDoCliente,
  totalDePaginas,
  validarFormCliente,
} from "./cadastro-cliente";
import { camposDoEnderecoSalvo } from "./endereco-entrega";

const CLIENTE: Cliente = {
  id: "c1",
  nome: "Maria Souza",
  telefone: "11987654321",
  observacoes: null,
  ativo: true,
  criado_em: "2026-10-11T12:00:00.000Z",
  atualizado_em: "2026-10-11T12:00:00.000Z",
  enderecos: [],
};

describe("formDoCliente", () => {
  it("cliente novo começa vazio; existente vem com o telefone mascarado", () => {
    expect(formDoCliente(null)).toEqual({
      nome: "",
      telefone: "",
      observacoes: "",
    });
    expect(formDoCliente(CLIENTE)).toEqual({
      nome: "Maria Souza",
      telefone: "(11) 98765-4321",
      observacoes: "",
    });
  });
});

describe("validarFormCliente", () => {
  it("monta o payload com o telefone só em dígitos e observação vazia como null", () => {
    expect(
      validarFormCliente({
        nome: "  Maria  ",
        telefone: "(11) 98765-4321",
        observacoes: "  ",
      }),
    ).toEqual({
      ok: true,
      payload: { nome: "Maria", telefone: "11987654321", observacoes: null },
    });
  });

  it("aponta cada campo inválido", () => {
    const resultado = validarFormCliente({
      nome: " ",
      telefone: "(11) 9876",
      observacoes: "x".repeat(501),
    });

    expect(resultado.ok).toBe(false);
    expect(!resultado.ok && Object.keys(resultado.erros).sort()).toEqual([
      "nome",
      "observacoes",
      "telefone",
    ]);
  });
});

describe("totalDePaginas", () => {
  it("arredonda para cima e nunca é zero", () => {
    expect(totalDePaginas(0, 20)).toBe(1);
    expect(totalDePaginas(20, 20)).toBe(1);
    expect(totalDePaginas(21, 20)).toBe(2);
  });
});

describe("camposDoEnderecoSalvo", () => {
  it("mascara o CEP e troca null por texto vazio", () => {
    expect(
      camposDoEnderecoSalvo({
        cep: "01310100",
        logradouro: "Avenida Paulista",
        numero: "1000",
        complemento: null,
        bairro: "Bela Vista",
        cidade: "São Paulo",
        uf: "SP",
        referencia: null,
      }),
    ).toEqual({
      cep: "01310-100",
      logradouro: "Avenida Paulista",
      numero: "1000",
      complemento: "",
      bairro: "Bela Vista",
      cidade: "São Paulo",
      uf: "SP",
      referencia: "",
    });
  });
});
