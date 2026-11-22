import { Card } from "../../../../components/ui";
import { CurrencyInput } from "../../../../components/ui/CurrencyInput";
import { FORMA_PAGAMENTO_LABEL } from "../../../../lib/forma-pagamento";
import { formatCurrency } from "../../../../lib/format";
import { ATALHOS_TROCO } from "../../../../lib/novo-pedido-delivery";
import type { FormaPagamento } from "../../../../types/comanda";
import type { CotacaoDelivery } from "../../../../types/delivery";

const FORMAS: FormaPagamento[] = [
  "pix",
  "dinheiro",
  "cartao_credito",
  "cartao_debito",
];

interface PagamentoDeliveryProps {
  forma: FormaPagamento;
  onForma: (forma: FormaPagamento) => void;
  trocoParaCents: number;
  onTrocoParaCents: (cents: number) => void;
  // Troco e "suficiente" vêm do backend: a tela não calcula.
  cotacao: CotacaoDelivery | null;
}

// Forma de pagamento prevista do delivery e "troco para" em dinheiro (PED-109).
export function PagamentoDelivery({
  forma,
  onForma,
  trocoParaCents,
  onTrocoParaCents,
  cotacao,
}: PagamentoDeliveryProps) {
  const temTroco = forma === "dinheiro" && trocoParaCents > 0;
  const trocoInsuficiente =
    temTroco && cotacao !== null && !cotacao.troco_suficiente;

  return (
    <Card className="flex flex-col gap-4">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-base font-semibold text-slate-900 dark:text-white">
          Pagamento na entrega
        </legend>
        <div className="grid grid-cols-2 gap-2">
          {FORMAS.map((opcao) => (
            <label
              key={opcao}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                forma === opcao
                  ? "border-orange-500 bg-orange-50 font-medium text-slate-900 dark:border-orange-500/70 dark:bg-orange-950/20 dark:text-white"
                  : "border-slate-200 text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:text-slate-300"
              }`}
            >
              <input
                type="radio"
                name="forma-pagamento"
                value={opcao}
                checked={forma === opcao}
                onChange={() => onForma(opcao)}
                className="accent-orange-600"
              />
              {FORMA_PAGAMENTO_LABEL[opcao]}
            </label>
          ))}
        </div>
      </fieldset>

      {forma === "dinheiro" && (
        <div className="flex flex-col gap-2">
          <CurrencyInput
            label="Troco para"
            valueCents={trocoParaCents}
            onChangeCents={onTrocoParaCents}
            error={
              trocoInsuficiente && cotacao
                ? `Valor menor que o total do pedido (${formatCurrency(cotacao.total)}).`
                : undefined
            }
          />
          <fieldset
            className="flex flex-wrap gap-2"
            aria-label="Atalhos de troco"
          >
            {ATALHOS_TROCO.map((valor) => {
              const cents = valor === null ? 0 : valor * 100;
              return (
                <button
                  key={valor ?? "sem-troco"}
                  type="button"
                  aria-pressed={trocoParaCents === cents}
                  onClick={() => onTrocoParaCents(cents)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                    trocoParaCents === cents
                      ? "bg-orange-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  }`}
                >
                  {valor === null ? "Sem troco" : formatCurrency(valor)}
                </button>
              );
            })}
          </fieldset>
          {temTroco && cotacao?.troco_suficiente && (
            <p
              role="status"
              className="text-sm font-semibold text-emerald-700 dark:text-emerald-400"
            >
              Levar troco: {formatCurrency(cotacao.troco)}
            </p>
          )}
          {!temTroco && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Cliente paga o valor exato.
            </p>
          )}
        </div>
      )}
    </Card>
  );
}
