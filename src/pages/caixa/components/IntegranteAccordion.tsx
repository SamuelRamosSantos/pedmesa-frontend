import { ChevronDown, User } from "lucide-react";
import { formatCurrency } from "../../../lib/format";
import type { ExtratoIntegranteResumo } from "../../../types/comanda";

interface IntegranteAccordionProps {
  integrante: ExtratoIntegranteResumo;
  isExpanded: boolean;
  onToggle: () => void;
}

export function IntegranteAccordion({ integrante, isExpanded, onToggle }: IntegranteAccordionProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-slate-50"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-600">
          <User className="h-4 w-4" />
        </div>
        <span className="flex-1 font-medium text-slate-900">{integrante.nome}</span>
        <span className="text-lg font-bold text-slate-900">{formatCurrency(integrante.total_a_pagar)}</span>
        <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
      </button>

      {isExpanded && (
        <div className="border-t border-slate-200 px-5 py-4">
          {integrante.itens_individuais.length === 0 ? (
            <p className="text-sm text-slate-400">Nenhum item individual — apenas cota compartilhada.</p>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 text-xs font-medium uppercase tracking-wide text-slate-400">
                <span>Produto</span>
                <span className="text-right">Qtd.</span>
                <span className="text-right">Preço Un.</span>
                <span className="text-right">Subtotal</span>
              </div>
              {integrante.itens_individuais.map((item, index) => (
                <div
                  key={`${item.produto}-${index}`}
                  className="grid grid-cols-[1fr_auto_auto_auto] gap-3 text-sm text-slate-700"
                >
                  <span>{item.produto}</span>
                  <span className="text-right">{item.qtd}</span>
                  <span className="text-right">{formatCurrency(item.preco_unitario)}</span>
                  <span className="text-right font-medium">{formatCurrency(item.subtotal)}</span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 flex flex-col gap-1.5 border-t border-slate-100 pt-3 text-sm">
            <div className="flex items-center justify-between text-slate-500">
              <span>Total Individual</span>
              <span>{formatCurrency(integrante.total_individual)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-500">
              <span>Cota Compartilhada</span>
              <span>{formatCurrency(integrante.cota_compartilhada)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 pt-1.5 font-semibold text-slate-900">
              <span>Total a Pagar</span>
              <span>{formatCurrency(integrante.total_a_pagar)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
