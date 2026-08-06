import { BadgePercent } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { CurrencyInput } from "../../../components/ui/CurrencyInput";
import { formatCurrency } from "../../../lib/format";
import { toCents } from "../../../lib/money";

export type DescontoTipoEntrada = "percentual" | "valor_fixo";

interface DescontoCardProps {
  subtotal: number;
  tipo: DescontoTipoEntrada;
  valor: number;
  descontoAplicado: number;
  totalFinal: number;
  onChangeTipo: (tipo: DescontoTipoEntrada) => void;
  onChangeValor: (valor: number) => void;
}

export function DescontoCard({
  subtotal,
  tipo,
  valor,
  descontoAplicado,
  totalFinal,
  onChangeTipo,
  onChangeValor,
}: DescontoCardProps) {
  const totalFinalInvalido = totalFinal < 0;

  return (
    <Card data-testid="card-desconto">
      <div className="flex items-center gap-2">
        <BadgePercent className="h-4 w-4 text-slate-400 dark:text-slate-500" />
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Desconto</h2>
      </div>

      <div className="mt-3 flex flex-col gap-3">
        <div className="flex items-end gap-2">
          <div className="inline-flex shrink-0 gap-1 rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => onChangeTipo("percentual")}
              data-testid="desconto-tipo-percentual"
              className={`rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
                tipo === "percentual"
                  ? "bg-orange-600 text-white"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
            >
              %
            </button>
            <button
              type="button"
              onClick={() => onChangeTipo("valor_fixo")}
              data-testid="desconto-tipo-valor-fixo"
              className={`rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
                tipo === "valor_fixo"
                  ? "bg-orange-600 text-white"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
            >
              R$
            </button>
          </div>

          <div className="flex-1">
            {tipo === "percentual" ? (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="desconto-percentual" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Percentual de desconto
                </label>
                <div className="relative">
                  <input
                    id="desconto-percentual"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    max={100}
                    step={0.01}
                    placeholder="0"
                    value={valor === 0 ? "" : valor}
                    onChange={(event) => onChangeValor(Math.max(0, Number(event.target.value) || 0))}
                    className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-3.5 pr-8 text-sm text-slate-900 shadow-sm outline-none transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-slate-400 dark:text-slate-500">
                    %
                  </span>
                </div>
              </div>
            ) : (
              <CurrencyInput
                label="Valor do desconto"
                id="desconto-valor-fixo"
                valueCents={toCents(valor)}
                onChangeCents={(cents) => onChangeValor(cents / 100)}
              />
            )}
          </div>
        </div>

        {valor > 0 && (
          <div className="flex flex-col gap-1.5 rounded-lg bg-slate-50 px-3 py-2.5 text-sm dark:bg-slate-800">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-orange-600 dark:text-orange-400">
              <span>Desconto</span>
              <span>- {formatCurrency(descontoAplicado)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 pt-1.5 font-semibold text-slate-900 dark:border-slate-700 dark:text-white">
              <span>Total Final</span>
              <span>{formatCurrency(Math.max(0, totalFinal))}</span>
            </div>
          </div>
        )}

        {totalFinalInvalido && (
          <p className="text-sm text-red-600 dark:text-red-400">
            O desconto informado é maior que o valor da comanda.
          </p>
        )}
      </div>
    </Card>
  );
}
