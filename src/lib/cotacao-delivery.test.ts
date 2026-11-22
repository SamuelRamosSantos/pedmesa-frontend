import { describe, expect, it } from "vitest";
import type { CotacaoDelivery } from "../types/delivery";
import {
  bloqueioDoEnvio,
  payloadDaCotacao,
  situacaoDaCotacao,
} from "./cotacao-delivery";

const LOCALIDADE = { cidade: "São Paulo", bairro: "Bela Vista" };
const ITENS = [{ produto_id: "p1", quantidade: 2 }];

const ATENDIDO: CotacaoDelivery = {
  atendido: true,
  motivo_nao_atendido: null,
  subtotal: 40,
  taxa_entrega: 5,
  origem_taxa: "bairro",
  tempo_estimado_min: 30,
  total: 45,
  pedido_minimo: 0,
  pedido_minimo_atingido: true,
  troco: 0,
  troco_suficiente: true,
};

const NAO_ATENDIDO: CotacaoDelivery = {
  ...ATENDIDO,
  atendido: false,
  motivo_nao_atendido:
    "O bairro Centro (Campinas) não é atendido pelo delivery.",
  taxa_entrega: null,
  origem_taxa: null,
  tempo_estimado_min: null,
};

describe("payloadDaCotacao", () => {
  it("sem localidade não cota", () => {
    expect(
      payloadDaCotacao({
        localidade: null,
        itens: ITENS,
        formaPagamento: "pix",
        trocoPara: null,
      }),
    ).toBeNull();
  });

  it("monta o pedido de cotação; troco só em dinheiro", () => {
    expect(
      payloadDaCotacao({
        localidade: LOCALIDADE,
        itens: ITENS,
        formaPagamento: "dinheiro",
        trocoPara: 50,
      }),
    ).toEqual({
      endereco: LOCALIDADE,
      itens: ITENS,
      forma_pagamento: "dinheiro",
      troco_para: 50,
    });
    expect(
      payloadDaCotacao({
        localidade: LOCALIDADE,
        itens: [],
        formaPagamento: "pix",
        trocoPara: 50,
      })?.troco_para,
    ).toBeNull();
  });
});

describe("situacaoDaCotacao", () => {
  it("traduz o estado da consulta", () => {
    expect(situacaoDaCotacao({ status: "idle", valor: null }, false)).toBe(
      "sem_endereco",
    );
    expect(
      situacaoDaCotacao({ status: "carregando", valor: null }, false),
    ).toBe("calculando");
    expect(situacaoDaCotacao({ status: "falhou", valor: null }, false)).toBe(
      "falhou",
    );
    expect(
      situacaoDaCotacao({ status: "concluida", valor: ATENDIDO }, false),
    ).toBe("atendido");
    expect(
      situacaoDaCotacao({ status: "concluida", valor: NAO_ATENDIDO }, false),
    ).toBe("nao_atendido");
  });

  it("enquanto o operador digita, mostra calculando (o valor anterior está velho)", () => {
    expect(
      situacaoDaCotacao({ status: "concluida", valor: ATENDIDO }, true),
    ).toBe("calculando");
    // Endereço acabou de ser definido: a consulta ainda nem começou.
    expect(situacaoDaCotacao({ status: "idle", valor: null }, true)).toBe(
      "calculando",
    );
  });
});

describe("bloqueioDoEnvio", () => {
  it("bairro não atendido bloqueia com a mensagem do backend", () => {
    expect(bloqueioDoEnvio(NAO_ATENDIDO)).toBe(
      "O bairro Centro (Campinas) não é atendido pelo delivery.",
    );
  });

  it("atendido ou sem cotação não bloqueia", () => {
    expect(bloqueioDoEnvio(ATENDIDO)).toBeNull();
    expect(bloqueioDoEnvio(null)).toBeNull();
  });
});
