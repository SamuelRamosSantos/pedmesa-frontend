import { ChevronDown, User } from "lucide-react";
import { formatCurrency } from "../../../lib/format";
import type { ExtratoIntegranteResumo } from "../../../types/comanda";

interface IntegranteAccordionProps {
  integrante: ExtratoIntegranteResumo;
  isExpanded: boolean;
  onToggle: () => void;
  descontoAplicado: number;
}

export function IntegranteAccordion({ integrante, isExpanded, onToggle, descontoAplicado }: IntegranteAccordionProps) {
  const totalComDesconto = integrante.total_a_pagar - descontoAplicado;
  const temDesconto = descontoAplicado > 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400">
          <User className="h-4 w-4" />
        </div>
        <span className="flex-1 font-medium text-slate-900 dark:text-white">{integrante.nome}</span>
        <span className="flex flex-col items-end">
          {temDesconto && (
            <span className="text-xs text-slate-400 line-through dark:text-slate-500">
              {formatCurrency(integrante.total_a_pagar)}
            </span>
          )}
          <span className="text-lg font-bold text-slate-900 dark:text-white">
            {formatCurrency(totalComDesconto)}
          </span>
        </span>
        <ChevronDown
          className={`h-5 w-5 text-slate-400 transition-transform dark:text-slate-500 ${isExpanded ? "rotate-180" : ""}`}
        />
      </button>

      {isExpanded && (
        <div className="border-t border-slate-200 px-5 py-4 dark:border-slate-800">
          {integrante.itens_individuais.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500">
              Nenhum item individual — apenas cota compartilhada.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                <span>Produto</span>
                <span className="text-right">Qtd.</span>
                <span className="text-right">Preço Un.</span>
                <span className="text-right">Subtotal</span>
              </div>
              {integrante.itens_individuais.map((item, index) => (
                <div
                  key={`${item.produto}-${index}`}
                  className="grid grid-cols-[1fr_auto_auto_auto] gap-3 text-sm text-slate-700 dark:text-slate-300"
                >
                  <span>{item.produto}</span>
                  <span className="text-right">{item.qtd}</span>
                  <span className="text-right">{formatCurrency(item.preco_unitario)}</span>
                  <span className="text-right font-medium">{formatCurrency(item.subtotal)}</span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 flex flex-col gap-1.5 border-t border-slate-100 pt-3 text-sm dark:border-slate-800">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span>Total Individual</span>
              <span>{formatCurrency(integrante.total_individual)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span>Cota Compartilhada</span>
              <span>{formatCurrency(integrante.cota_compartilhada)}</span>
            </div>
            {temDesconto && (
              <div className="flex items-center justify-between text-orange-600 dark:text-orange-400">
                <span>Desconto</span>
                <span>- {formatCurrency(descontoAplicado)}</span>
              </div>
            )}
            <div className="flex items-center justify-between border-t border-slate-100 pt-1.5 font-semibold text-slate-900 dark:border-slate-800 dark:text-white">
              <span>Total a Pagar</span>
              <span>{formatCurrency(totalComDesconto)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
