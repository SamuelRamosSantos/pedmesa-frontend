import { fromCents, toCents } from "./money";
import type { DescontoTipo } from "../types/comanda";

export interface DescontoInput {
  tipo: DescontoTipo;
  valor: number;
}

export interface DescontoCalculado {
  subtotal: number;
  desconto_aplicado: number;
  total_final: number;
}

// Espelha a lógica de cálculo do backend (desconto-calculator.ts) para permitir
// recalcular o total em tempo real na tela, antes de confirmar o fechamento.
// Diferente do backend, não lança erro quando o desconto excede o subtotal —
// aqui só devolve o número (podendo ficar negativo) para a tela decidir como avisar.
export function calcularDesconto(subtotal: number, desconto: DescontoInput): DescontoCalculado {
  const subtotalCents = toCents(subtotal);

  if (desconto.tipo === "nenhum" || desconto.valor <= 0) {
    return { subtotal: fromCents(subtotalCents), desconto_aplicado: 0, total_final: fromCents(subtotalCents) };
  }

  const descontoCents =
    desconto.tipo === "percentual" ? Math.round((subtotalCents * desconto.valor) / 100) : toCents(desconto.valor);

  return {
    subtotal: fromCents(subtotalCents),
    desconto_aplicado: fromCents(descontoCents),
    total_final: fromCents(subtotalCents - descontoCents),
  };
}

export interface RateioInput {
  id: string;
  valorBase: number;
}

export interface RateioResultado {
  id: string;
  valorBase: number;
  descontoAplicado: number;
  valorFinal: number;
}

// Rateia um desconto total proporcionalmente ao valorBase de cada item (pode ser o
// total de um integrante ou o subtotal de um produto). O último item da lista absorve
// o centavo de arredondamento, garantindo que a soma bata exatamente com o desconto total.
// Reaproveitada tanto para a Divisão por Integrante quanto para a coluna de desconto em Todos os Itens.
export function ratearDesconto(itens: RateioInput[], descontoTotal: number): RateioResultado[] {
  const descontoTotalCents = toCents(descontoTotal);
  const somaBaseCents = itens.reduce((soma, item) => soma + toCents(item.valorBase), 0);

  if (descontoTotalCents <= 0 || somaBaseCents === 0) {
    return itens.map((item) => ({
      id: item.id,
      valorBase: fromCents(toCents(item.valorBase)),
      descontoAplicado: 0,
      valorFinal: fromCents(toCents(item.valorBase)),
    }));
  }

  let distribuidoCents = 0;

  return itens.map((item, index) => {
    const baseCents = toCents(item.valorBase);
    const isUltimo = index === itens.length - 1;
    const descontoCents = isUltimo
      ? descontoTotalCents - distribuidoCents
      : Math.round((baseCents / somaBaseCents) * descontoTotalCents);

    distribuidoCents += descontoCents;

    return {
      id: item.id,
      valorBase: fromCents(baseCents),
      descontoAplicado: fromCents(descontoCents),
      valorFinal: fromCents(baseCents - descontoCents),
    };
  });
}
