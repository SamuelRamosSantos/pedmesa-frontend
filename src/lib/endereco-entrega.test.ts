import { describe, expect, it } from "vitest";
import type { Cliente } from "../types/cliente";
import {
  CAMPOS_ENDERECO_VAZIOS,
  enderecoNovoDoFormulario,
  localidadeDaEntrega,
  preencherComCep,
  type CamposEndereco,
} from "./endereco-entrega";

const PREENCHIDO: CamposEndereco = {
  cep: "01310-100",
  logradouro: " Avenida Paulista ",
  numero: "1000",
  complemento: "",
  bairro: "Bela Vista",
  cidade: "São Paulo",
  uf: "sp",
  referencia: "  ",
};

const CLIENTE: Cliente = {
  id: "c1",
  nome: "Maria",
  telefone: "11987654321",
  observacoes: null,
  ativo: true,
  criado_em: "",
  atualizado_em: "",
  enderecos: [
    {
      id: "e1",
      cep: "04101000",
      logradouro: "Rua Domingos de Morais",
      numero: "1500",
      complemento: null,
      bairro: "Vila Mariana",
      cidade: "São Paulo",
      uf: "SP",
      referencia: null,
      principal: true,
      criado_em: "",
    },
  ],
};

describe("preencherComCep", () => {
  it("preenche rua, bairro, cidade e UF e foca o número", () => {
    const resultado = preencherComCep(
      { ...CAMPOS_ENDERECO_VAZIOS, cep: "01310-100", numero: "10" },
      { logradouro: "Avenida Paulista", bairro: "Bela Vista", cidade: "São Paulo", uf: "SP" }
    );

    expect(resultado).toEqual({
      campos: {
        ...CAMPOS_ENDERECO_VAZIOS,
        cep: "01310-100",
        numero: "10",
        logradouro: "Avenida Paulista",
        bairro: "Bela Vista",
        cidade: "São Paulo",
        uf: "SP",
      },
      focarEm: "numero",
    });
  });

  it("CEP geral de cidade (sem rua) limpa a rua anterior e foca o logradouro", () => {
    const resultado = preencherComCep(
      { ...PREENCHIDO },
      { logradouro: "", bairro: "", cidade: "Espírito Santo do Pinhal", uf: "SP" }
    );

    expect(resultado.campos.logradouro).toBe("");
    expect(resultado.campos.bairro).toBe("");
    expect(resultado.focarEm).toBe("logradouro");
  });
});

describe("enderecoNovoDoFormulario", () => {
  it("normaliza: CEP só dígitos, UF maiúscula, textos aparados e opcionais vazios como null", () => {
    expect(enderecoNovoDoFormulario(PREENCHIDO)).toEqual({
      cep: "01310100",
      logradouro: "Avenida Paulista",
      numero: "1000",
      complemento: null,
      bairro: "Bela Vista",
      cidade: "São Paulo",
      uf: "SP",
      referencia: null,
    });
  });

  it.each([
    ["CEP incompleto", { cep: "01310" }],
    ["sem número", { numero: " " }],
    ["sem bairro", { bairro: "" }],
    ["UF inválida", { uf: "S" }],
  ])("null quando está %s", (_caso, alteracao) => {
    expect(enderecoNovoDoFormulario({ ...PREENCHIDO, ...alteracao })).toBeNull();
  });
});

describe("localidadeDaEntrega", () => {
  it("endereço salvo escolhido", () => {
    expect(localidadeDaEntrega(CLIENTE, "e1", CAMPOS_ENDERECO_VAZIOS)).toEqual({ cidade: "São Paulo", bairro: "Vila Mariana" });
  });

  it("endereço novo usa o formulário", () => {
    expect(localidadeDaEntrega(CLIENTE, "novo", PREENCHIDO)).toEqual({ cidade: "São Paulo", bairro: "Bela Vista" });
  });

  it("null sem bairro/cidade ou com escolha que não existe", () => {
    expect(localidadeDaEntrega(null, "novo", CAMPOS_ENDERECO_VAZIOS)).toBeNull();
    expect(localidadeDaEntrega(null, "novo", { ...PREENCHIDO, bairro: " " })).toBeNull();
    expect(localidadeDaEntrega(CLIENTE, "outro", PREENCHIDO)).toBeNull();
  });
});
