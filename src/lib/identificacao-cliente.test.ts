import { describe, expect, it } from "vitest";
import type { Cliente, EnderecoCliente } from "../types/cliente";
import {
  dadosDaIdentificacao,
  enderecoPadrao,
  resumoEndereco,
  situacaoDaIdentificacao,
  telefoneProntoParaBusca,
} from "./identificacao-cliente";

function endereco(id: string, principal: boolean): EnderecoCliente {
  return {
    id,
    cep: "01310100",
    logradouro: "Avenida Paulista",
    numero: "1000",
    complemento: null,
    bairro: "Bela Vista",
    cidade: "São Paulo",
    uf: "SP",
    referencia: null,
    principal,
    criado_em: "2026-10-11T12:00:00.000Z",
  };
}

const CLIENTE: Cliente = {
  id: "c1",
  nome: "Maria",
  telefone: "11987654321",
  observacoes: null,
  ativo: true,
  criado_em: "2026-10-11T12:00:00.000Z",
  atualizado_em: "2026-10-11T12:00:00.000Z",
  enderecos: [],
};

describe("telefoneProntoParaBusca", () => {
  it.each([
    ["celular com 11 dígitos", "11987654321"],
    ["fixo com 10 dígitos", "1134567890"],
    ["fixo começando com 5", "1154567890"],
  ])("busca: %s", (_caso, digitos) => {
    expect(telefoneProntoParaBusca(digitos)).toBe(true);
  });

  it.each([
    ["incompleto", "119876"],
    ["celular ainda com 10 dígitos (3º dígito 9)", "1198765432"],
    ["11 dígitos que não é celular", "11387654321"],
    ["fixo que começa com 6", "1164567890"],
    ["DDD com zero", "0198765432"],
    ["DDD terminado em zero", "10987654321"],
    ["vazio", ""],
  ])("não busca: %s", (_caso, digitos) => {
    expect(telefoneProntoParaBusca(digitos)).toBe(false);
  });
});

describe("situacaoDaIdentificacao", () => {
  it("traduz o estado da consulta", () => {
    expect(situacaoDaIdentificacao({ status: "idle", valor: null })).toBe(
      "digitando",
    );
    expect(situacaoDaIdentificacao({ status: "carregando", valor: null })).toBe(
      "buscando",
    );
    expect(situacaoDaIdentificacao({ status: "falhou", valor: null })).toBe(
      "falhou",
    );
    expect(situacaoDaIdentificacao({ status: "concluida", valor: null })).toBe(
      "novo",
    );
    expect(
      situacaoDaIdentificacao({ status: "concluida", valor: CLIENTE }),
    ).toBe("encontrado");
  });
});

describe("enderecoPadrao", () => {
  it("pré-seleciona o principal", () => {
    expect(enderecoPadrao([endereco("a", false), endereco("b", true)])).toBe(
      "b",
    );
  });

  it("sem principal, o primeiro; sem endereço, cadastro de novo", () => {
    expect(enderecoPadrao([endereco("a", false), endereco("b", false)])).toBe(
      "a",
    );
    expect(enderecoPadrao([])).toBe("novo");
  });
});

describe("resumoEndereco", () => {
  it("com e sem complemento", () => {
    expect(
      resumoEndereco({
        logradouro: "Avenida Paulista",
        numero: "1000",
        complemento: "Apto 52",
      }),
    ).toBe("Avenida Paulista, 1000 - Apto 52");
    expect(
      resumoEndereco({ logradouro: "Rua A", numero: "10", complemento: null }),
    ).toBe("Rua A, 10");
  });
});

describe("dadosDaIdentificacao", () => {
  it("monta cliente e endereço salvo", () => {
    expect(
      dadosDaIdentificacao({
        telefoneDigitos: "11987654321",
        nome: "  Maria ",
        escolhaEndereco: "e1",
      }),
    ).toEqual({
      cliente: { nome: "Maria", telefone: "11987654321" },
      endereco: { tipo: "salvo", enderecoId: "e1" },
    });
  });

  it("endereço novo", () => {
    expect(
      dadosDaIdentificacao({
        telefoneDigitos: "1134567890",
        nome: "João",
        escolhaEndereco: "novo",
      })?.endereco,
    ).toEqual({
      tipo: "novo",
    });
  });

  it("null sem nome ou com telefone incompleto", () => {
    expect(
      dadosDaIdentificacao({
        telefoneDigitos: "11987654321",
        nome: "  ",
        escolhaEndereco: "novo",
      }),
    ).toBeNull();
    expect(
      dadosDaIdentificacao({
        telefoneDigitos: "1198765",
        nome: "Maria",
        escolhaEndereco: "novo",
      }),
    ).toBeNull();
  });
});
