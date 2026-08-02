import type { StatusItem } from "../../../types/pedido";
import {
  FILTROS_STATUS_PEDIDO,
  STATUS_ITEM_BADGE_CLASS,
  statusItemLabelPlural,
} from "../status-item-flow";
import type { FiltroStatusPedido } from "../status-item-flow";

const ORDEM_RESUMO: StatusItem[] = ["pendente", "em_preparo", "pronto", "entregue"];

interface PedidosResumoBarProps {
  contagens: Partial<Record<StatusItem, number>>;
  filtro: FiltroStatusPedido;
  onFiltroChange: (filtro: FiltroStatusPedido) => void;
}

export function PedidosResumoBar({ contagens, filtro, onFiltroChange }: PedidosResumoBarProps) {
  const segmentos = ORDEM_RESUMO.filter((status) => (contagens[status] ?? 0) > 0);

  return (
    <div className="flex flex-col gap-2 px-4 pb-3">
      {segmentos.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5" data-testid="pedidos-resumo">
          {segmentos.map((status) => {
            const count = contagens[status] ?? 0;

            return (
              <span
                key={status}
                data-testid={`resumo-${status}`}
                className={`rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_ITEM_BADGE_CLASS[status]}`}
              >
                {count} {statusItemLabelPlural(status, count)}
              </span>
            );
          })}
        </div>
      )}

      <div className="inline-flex w-fit gap-1 rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-800">
        {FILTROS_STATUS_PEDIDO.map((opcao) => (
          <button
            key={opcao.value}
            type="button"
            onClick={() => onFiltroChange(opcao.value)}
            data-testid={`filtro-pedidos-${opcao.value}`}
            className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              filtro === opcao.value
                ? "bg-orange-600 text-white"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            {opcao.label}
          </button>
        ))}
      </div>
    </div>
  );
}
