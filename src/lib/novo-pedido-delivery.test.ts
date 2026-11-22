import { describe, expect, it } from "vitest";
import type { CotacaoDelivery } from "../types/delivery";
import {
  type EntradaPedidoDelivery,
  type EstadoEnvio,
  etapaConcluida,
  etapaLiberada,
  mensagemPedidoCriado,
  montarPedidoDelivery,
  motivoQueImpedeEnvio,
  pendenciaDaEtapa,
  primeiraPendencia,
} from "./novo-pedido-delivery";

const ITENS = [{ produto_id: "p1", quantidade: 2, observacao: null }];
const ENDERECO_NOVO = {
  cep: "01310100",
  logradouro: "Avenida Paulista",
  numero: "1000",
  complemento: null,
  bairro: "Bela Vista",
  cidade: "São Paulo",
  uf: "SP",
  referencia: null,
};
const CLIENTE_SALVO = {
  cliente: { nome: "Maria", telefone: "11987654321" },
  endereco: { tipo: "salvo" as const, enderecoId: "e1" },
};
const CLIENTE_NOVO_ENDERECO = {
  ...CLIENTE_SALVO,
  endereco: { tipo: "novo" as const },
};

const ENTRADA: EntradaPedidoDelivery = {
  cliente: CLIENTE_SALVO,
  enderecoNovo: null,
  salvarEndereco: false,
  itens: ITENS,
  formaPagamento: "pix",
  trocoPara: null,
};

const COTACAO: CotacaoDelivery = {
  atendido: true,
  motivo_nao_atendido: null,
  subtotal: 40,
  taxa_entrega: 5,
  origem_taxa: "bairro",
  tempo_estimado_min: 30,
  total: 45,
  pedido_minimo: 0,
  pedido_minimo_atingido: true,
  troco: 5,
  troco_suficiente: true,
};

const PRONTO: EstadoEnvio = {
  ...ENTRADA,
  motivoCliente: null,
  situacaoCotacao: "atendido",
  cotacao: COTACAO,
};

describe("montarPedidoDelivery", () => {
  it("endereço salvo: manda endereco_id", () => {
    expect(montarPedidoDelivery(ENTRADA)).toEqual({
      cliente: { nome: "Maria", telefone: "11987654321" },
      itens: ITENS,
      forma_pagamento: "pix",
      troco_para: null,
      endereco_id: "e1",
    });
  });

  it("endereço novo: manda o endereço e salvar_endereco", () => {
    expect(
      montarPedidoDelivery({
        ...ENTRADA,
        cliente: CLIENTE_NOVO_ENDERECO,
        enderecoNovo: ENDERECO_NOVO,
        salvarEndereco: true,
      }),
    ).toMatchObject({ endereco: ENDERECO_NOVO, salvar_endereco: true });
  });

  it("troco só em dinheiro", () => {
    expect(
      montarPedidoDelivery({
        ...ENTRADA,
        formaPagamento: "dinheiro",
        trocoPara: 50,
      })?.troco_para,
    ).toBe(50);
    expect(
      montarPedidoDelivery({
        ...ENTRADA,
        formaPagamento: "cartao_debito",
        trocoPara: 50,
      })?.troco_para,
    ).toBeNull();
  });

  it("null sem cliente, sem itens ou com endereço novo incompleto", () => {
    expect(montarPedidoDelivery({ ...ENTRADA, cliente: null })).toBeNull();
    expect(montarPedidoDelivery({ ...ENTRADA, itens: [] })).toBeNull();
    expect(
      montarPedidoDelivery({ ...ENTRADA, cliente: CLIENTE_NOVO_ENDERECO }),
    ).toBeNull();
  });
});

describe("motivoQueImpedeEnvio", () => {
  it("pronto para enviar", () => {
    expect(motivoQueImpedeEnvio(PRONTO)).toBeNull();
  });

  it.each<[string, Partial<EstadoEnvio>, string]>([
    [
      "sem cliente",
      { cliente: null },
      "Escolha um cliente na busca ou cadastre um novo.",
    ],
    [
      "cadastro do cliente incompleto (motivo da busca)",
      { cliente: null, motivoCliente: "Informe o nome do cliente." },
      "Informe o nome do cliente.",
    ],
    [
      "endereço novo incompleto",
      { cliente: CLIENTE_NOVO_ENDERECO },
      "Complete o endereço de entrega",
    ],
    ["sem itens", { itens: [] }, "Adicione ao menos um item."],
    [
      "cotação em andamento",
      { situacaoCotacao: "calculando" },
      "Calculando o total...",
    ],
    [
      "bairro não atendido",
      {
        cotacao: {
          ...COTACAO,
          atendido: false,
          motivo_nao_atendido: "O bairro X (Y) não é atendido pelo delivery.",
        },
      },
      "O bairro X (Y) não é atendido pelo delivery.",
    ],
    [
      "pedido mínimo",
      {
        cotacao: {
          ...COTACAO,
          pedido_minimo: 50,
          pedido_minimo_atingido: false,
        },
      },
      "O pedido mínimo para delivery é R$",
    ],
    [
      "troco insuficiente em dinheiro",
      {
        formaPagamento: "dinheiro",
        trocoPara: 20,
        cotacao: { ...COTACAO, troco_suficiente: false },
      },
      "O troco para é menor que o total",
    ],
  ])("bloqueia: %s", (_caso, alteracao, mensagem) => {
    expect(motivoQueImpedeEnvio({ ...PRONTO, ...alteracao })).toContain(
      mensagem,
    );
  });

  it("cotação que falhou não bloqueia (o backend confere ao criar)", () => {
    expect(
      motivoQueImpedeEnvio({
        ...PRONTO,
        situacaoCotacao: "falhou",
        cotacao: null,
      }),
    ).toBeNull();
  });
});

describe("etapas", () => {
  const BAIRRO_FORA = {
    cotacao: {
      ...COTACAO,
      atendido: false,
      motivo_nao_atendido: "O bairro X (Y) não é atendido pelo delivery.",
    },
  };

  it("bairro não atendido trava já a etapa do cliente", () => {
    expect(pendenciaDaEtapa("cliente", { ...PRONTO, ...BAIRRO_FORA })).toBe(
      "O bairro X (Y) não é atendido pelo delivery.",
    );
  });

  it("enquanto calcula, as etapas de cliente e produtos não travam; o envio sim", () => {
    const calculando: EstadoEnvio = {
      ...PRONTO,
      ...BAIRRO_FORA,
      situacaoCotacao: "calculando",
    };

    expect(pendenciaDaEtapa("cliente", calculando)).toBeNull();
    expect(pendenciaDaEtapa("produtos", calculando)).toBeNull();
    expect(pendenciaDaEtapa("pagamento", calculando)).toBe(
      "Calculando o total...",
    );
  });

  it("aponta a primeira etapa com pendência", () => {
    expect(primeiraPendencia({ ...PRONTO, itens: [] })).toEqual({
      etapa: "produtos",
      motivo: "Adicione ao menos um item.",
    });
    expect(primeiraPendencia(PRONTO)).toBeNull();
  });

  it("concluída exige ela e as anteriores completas; a última nunca", () => {
    expect(etapaConcluida("cliente", PRONTO)).toBe(true);
    expect(etapaConcluida("produtos", { ...PRONTO, cliente: null })).toBe(
      false,
    );
    expect(etapaConcluida("pagamento", PRONTO)).toBe(false);
  });

  it("libera uma etapa só com as anteriores concluídas", () => {
    const semItens: EstadoEnvio = { ...PRONTO, itens: [] };

    expect(etapaLiberada("cliente", { ...PRONTO, cliente: null })).toBe(true);
    expect(etapaLiberada("produtos", { ...PRONTO, cliente: null })).toBe(false);
    expect(etapaLiberada("produtos", semItens)).toBe(true);
    expect(etapaLiberada("pagamento", semItens)).toBe(false);
    expect(etapaLiberada("pagamento", PRONTO)).toBe(true);
  });
});

describe("mensagemPedidoCriado", () => {
  it("número com 4 dígitos", () => {
    expect(mensagemPedidoCriado(7)).toBe("Delivery #0007 criado");
    expect(mensagemPedidoCriado(12345)).toBe("Delivery #12345 criado");
  });
});
