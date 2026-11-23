import { SeletorFormaPagamento } from "../../../../components/pagamento/SeletorFormaPagamento";
import { Card } from "../../../../components/ui";
import { CurrencyInput } from "../../../../components/ui/CurrencyInput";
import { formatCurrency } from "../../../../lib/format";
import { ATALHOS_TROCO } from "../../../../lib/novo-pedido-delivery";
import { CLASSES_DO_TOM } from "../../../../lib/tons";
import type { FormaPagamento } from "../../../../types/comanda";
import type { CotacaoDelivery } from "../../../../types/delivery";

interface PagamentoDeliveryProps {
  forma: FormaPagamento;
  onForma: (forma: FormaPagamento) => void;
  trocoParaCents: number;
  onTrocoParaCents: (cents: number) => void;
  // Troco e "suficiente" vêm do backend: a tela não calcula.
  cotacao: CotacaoDelivery | null;
}

// Forma de pagamento prevista do delivery e "troco para" em dinheiro (PED-109, PED-139).
// A forma usa os mesmos botões do fechamento do caixa (PED-123).
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
      <h2 className="text-titulo-secao text-slate-900 dark:text-white">
        Pagamento na entrega
      </h2>
      <SeletorFormaPagamento
        rotulo="Forma de pagamento"
        valor={forma}
        onChange={onForma}
      />

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
                  className={`rounded-full px-3 py-1 text-legenda font-semibold transition-colors ${
                    trocoParaCents === cents
                      ? "bg-marca-600 text-white"
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
              className={`text-corpo font-semibold ${CLASSES_DO_TOM.sucesso.texto}`}
            >
              Levar troco: {formatCurrency(cotacao.troco)}
            </p>
          )}
          {!temTroco && (
            <p className="text-corpo text-slate-500 dark:text-slate-400">
              Cliente paga o valor exato.
            </p>
          )}
        </div>
      )}
    </Card>
  );
}
