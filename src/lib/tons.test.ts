import { describe, expect, it } from "vitest";
import type { StatusEntrega } from "../types/delivery";
import type { StatusItem } from "../types/pedido";
import { TOM_STATUS_ENTREGA } from "./expedicao";
import { TOM_STATUS_ITEM } from "./status-item";
import { CLASSES_DO_TOM, SIGNIFICADO_DO_TOM, TONS } from "./tons";

const STATUS_ITEM: StatusItem[] = [
  "pendente",
  "em_preparo",
  "pronto",
  "entregue",
  "cancelado",
];

const STATUS_ENTREGA: StatusEntrega[] = [
  "em_producao",
  "pronto_para_envio",
  "em_rota",
  "entregue",
  "cancelado",
];

describe("paleta semântica", () => {
  it("todo tom tem significado e as quatro variações de classe", () => {
    for (const tom of TONS) {
      expect(SIGNIFICADO_DO_TOM[tom]).toBeTruthy();
      const classes = CLASSES_DO_TOM[tom];
      expect(classes.selo).toBeTruthy();
      expect(classes.seloForte).toBeTruthy();
      expect(classes.superficie).toBeTruthy();
      expect(classes.texto).toBeTruthy();
    }
  });

  it("todo status de item tem um tom válido", () => {
    for (const status of STATUS_ITEM) {
      expect(TONS).toContain(TOM_STATUS_ITEM[status]);
    }
  });

  it("todo status de entrega tem um tom válido", () => {
    for (const status of STATUS_ENTREGA) {
      expect(TONS).toContain(TOM_STATUS_ENTREGA[status]);
    }
  });

  it("vermelho não é status de fluxo: pendente aguarda, não é erro", () => {
    expect(TOM_STATUS_ITEM.pendente).toBe("aviso");
    expect(Object.values(TOM_STATUS_ITEM)).not.toContain("perigo");
    expect(Object.values(TOM_STATUS_ENTREGA)).not.toContain("perigo");
  });

  it("o mesmo momento tem o mesmo tom na cozinha e na expedição", () => {
    expect(TOM_STATUS_ENTREGA.em_producao).toBe(TOM_STATUS_ITEM.em_preparo);
    expect(TOM_STATUS_ENTREGA.pronto_para_envio).toBe(TOM_STATUS_ITEM.pronto);
  });
});
