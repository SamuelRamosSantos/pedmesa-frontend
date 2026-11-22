import { describe, expect, it } from "vitest";
import type { EntregaPainel } from "../types/delivery";
import {
  AVANCAR,
  agruparPorColuna,
  aguardandoCozinha,
  aplicarEstado,
  aplicarStatusOtimista,
  exigeMotivo,
  formatarNumeroEntrega,
  mesclarComPendentes,
  motivoValido,
  podeCancelar,
  restaurarEntrega,
  textosDoMotivo,
  tomDoTempo,
  VOLTAR,
} from "./expedicao";

function entrega(
  id: string,
  alteracao: Partial<EntregaPainel> = {},
): EntregaPainel {
  return {
    id,
    numero_entrega: 7,
    status_entrega: "em_producao",
    versao: 1,
    cliente: { nome: "Maria", telefone: "11987654321" },
    bairro: "Bela Vista",
    endereco_resumido: "Avenida Paulista, 1000",
    total: 45,
    taxa_isenta: false,
    forma_pagamento_prevista: "dinheiro",
    troco: 5,
    troco_suficiente: true,
    criado_em: "2026-10-11T18:00:00.000Z",
    previsao_entrega_em: "2026-10-11T18:40:00.000Z",
    atrasado: false,
    status_preparo: "pendente",
    ...alteracao,
  };
}

describe("desfazer entrega (PED-127)", () => {
  it("entregue volta para em rota, com motivo", () => {
    expect(VOLTAR.entregue).toEqual({
      label: "Desfazer entrega",
      para: "em_rota",
    });
    expect(exigeMotivo("entregue", "em_rota")).toBe(true);
    expect(podeCancelar("entregue")).toBe(false);
  });

  it("textos do modal de motivo para cada caso", () => {
    expect(textosDoMotivo("entregue", "em_rota", 7)).toMatchObject({
      titulo: "Desfazer entrega #0007",
      rotuloConfirmar: "Desfazer entrega",
      perigo: true,
    });
    expect(textosDoMotivo("em_producao", "cancelado", 7)).toMatchObject({
      titulo: "Cancelar entrega #0007",
      perigo: true,
    });
    expect(textosDoMotivo("em_rota", "pronto_para_envio", 7)).toMatchObject({
      titulo: "Registrar retorno da entrega #0007",
      perigo: false,
    });
  });
});

describe("fluxo de status (espelho do backend)", () => {
  it("avançar e voltar", () => {
    expect(AVANCAR.em_producao?.para).toBe("pronto_para_envio");
    expect(AVANCAR.pronto_para_envio?.para).toBe("em_rota");
    expect(AVANCAR.em_rota?.para).toBe("entregue");
    expect(AVANCAR.entregue).toBeUndefined();
    expect(VOLTAR.pronto_para_envio?.para).toBe("em_producao");
    expect(VOLTAR.em_rota?.para).toBe("pronto_para_envio");
    expect(VOLTAR.em_producao).toBeUndefined();
  });

  it("em rota não cancela direto", () => {
    expect(podeCancelar("em_producao")).toBe(true);
    expect(podeCancelar("pronto_para_envio")).toBe(true);
    expect(podeCancelar("em_rota")).toBe(false);
    expect(podeCancelar("entregue")).toBe(false);
  });

  it("motivo obrigatório ao cancelar e ao voltar de em rota", () => {
    expect(exigeMotivo("em_producao", "cancelado")).toBe(true);
    expect(exigeMotivo("em_rota", "pronto_para_envio")).toBe(true);
    expect(exigeMotivo("pronto_para_envio", "em_producao")).toBe(false);
    expect(exigeMotivo("em_rota", "entregue")).toBe(false);
  });

  it("motivo com no mínimo 5 caracteres (sem contar espaços nas pontas)", () => {
    expect(motivoValido("   abcd  ")).toBe(false);
    expect(motivoValido("abcde")).toBe(true);
  });

  it("pronto para envio só com a cozinha concluída", () => {
    expect(
      aguardandoCozinha(entrega("a", { status_preparo: "em_preparo" })),
    ).toBe(true);
    expect(aguardandoCozinha(entrega("a", { status_preparo: "pronto" }))).toBe(
      false,
    );
    expect(
      aguardandoCozinha(
        entrega("a", {
          status_entrega: "pronto_para_envio",
          status_preparo: "pendente",
        }),
      ),
    ).toBe(false);
  });
});

describe("agruparPorColuna", () => {
  it("separa por status, sem canceladas; mais antigas primeiro e entregues mais recentes primeiro", () => {
    const colunas = agruparPorColuna([
      entrega("b", { criado_em: "2026-10-11T18:10:00.000Z" }),
      entrega("a", { criado_em: "2026-10-11T18:00:00.000Z" }),
      entrega("c", { status_entrega: "em_rota" }),
      entrega("x", { status_entrega: "cancelado" }),
      entrega("e1", {
        status_entrega: "entregue",
        criado_em: "2026-10-11T17:00:00.000Z",
      }),
      entrega("e2", {
        status_entrega: "entregue",
        criado_em: "2026-10-11T17:30:00.000Z",
      }),
    ]);

    expect(colunas.em_producao.map((e) => e.id)).toEqual(["a", "b"]);
    expect(colunas.em_rota.map((e) => e.id)).toEqual(["c"]);
    expect(colunas.entregue.map((e) => e.id)).toEqual(["e2", "e1"]);
    expect(colunas.pronto_para_envio).toEqual([]);
  });
});

describe("tomDoTempo", () => {
  const previsao = "2026-10-11T18:40:00.000Z";

  it("neutro com folga, alerta nos 10 min finais, crítico depois da previsão", () => {
    expect(
      tomDoTempo(
        entrega("a", { previsao_entrega_em: previsao }),
        new Date("2026-10-11T18:20:00.000Z"),
      ),
    ).toBe("neutro");
    expect(
      tomDoTempo(
        entrega("a", { previsao_entrega_em: previsao }),
        new Date("2026-10-11T18:30:00.000Z"),
      ),
    ).toBe("alerta");
    expect(
      tomDoTempo(
        entrega("a", { previsao_entrega_em: previsao }),
        new Date("2026-10-11T18:40:01.000Z"),
      ),
    ).toBe("critico");
  });

  it("sem previsão ou já entregue: neutro", () => {
    const depois = new Date("2026-10-11T20:00:00.000Z");
    expect(
      tomDoTempo(entrega("a", { previsao_entrega_em: null }), depois),
    ).toBe("neutro");
    expect(
      tomDoTempo(entrega("a", { status_entrega: "entregue" }), depois),
    ).toBe("neutro");
  });
});

describe("atualização otimista", () => {
  const lista = [entrega("a"), entrega("b")];

  it("move na hora e confirma com o estado do servidor", () => {
    const otimista = aplicarStatusOtimista(lista, "a", "pronto_para_envio");
    expect(otimista[0].status_entrega).toBe("pronto_para_envio");
    expect(otimista[1]).toBe(lista[1]);

    const confirmada = aplicarEstado(otimista, {
      id: "a",
      numero_entrega: 7,
      status_entrega: "entregue",
      versao: 4,
      previsao_entrega_em: null,
      saiu_em: null,
      entregue_em: null,
      motivo_cancelamento: null,
    });
    expect(confirmada[0]).toMatchObject({
      status_entrega: "entregue",
      versao: 4,
      atrasado: false,
    });
  });

  it("rollback devolve o card como estava", () => {
    const otimista = aplicarStatusOtimista(lista, "a", "em_rota");
    expect(restaurarEntrega(otimista, lista[0])[0]).toBe(lista[0]);
  });

  it("polling não desfaz transição em andamento", () => {
    const local = aplicarStatusOtimista(lista, "a", "pronto_para_envio");
    const doServidor = [
      entrega("a"),
      entrega("b", { total: 99 }),
      entrega("c"),
    ];
    const mesclado = mesclarComPendentes(doServidor, local, new Set(["a"]));

    expect(mesclado.map((e) => [e.id, e.status_entrega, e.total])).toEqual([
      ["a", "pronto_para_envio", 45],
      ["b", "em_producao", 99],
      ["c", "em_producao", 45],
    ]);
  });
});

describe("formatarNumeroEntrega", () => {
  it("4 dígitos", () => {
    expect(formatarNumeroEntrega(7)).toBe("#0007");
  });
});
