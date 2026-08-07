import {
  AlertTriangle,
  Banknote,
  CheckCircle2,
  CreditCard,
  HandCoins,
  Landmark,
  Loader2,
  Plus,
  QrCode,
  Send,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import type { ComponentType } from "react";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { CurrencyInput } from "../../../components/ui/CurrencyInput";
import { FORMA_PAGAMENTO_LABEL } from "../../../lib/forma-pagamento";
import { formatCurrency } from "../../../lib/format";
import { fromCents, toCents } from "../../../lib/money";
import type { FormaPagamento, PagamentoComanda } from "../../../types/comanda";

interface PagamentoSidebarProps {
  pagamentos: PagamentoComanda[];
  totalComanda: number;
  isSubmitting: boolean;
  isAddingPagamento: boolean;
  removendoPagamentoId: string | null;
  podeRegistrarPagamento: boolean;
  onAddPagamento: (forma: FormaPagamento, valor: number) => void;
  onRemovePagamento: (id: string) => void;
  onConfirmar: () => void;
}

const FORMAS: { value: FormaPagamento; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { value: "pix", label: "Pix", icon: QrCode },
  { value: "dinheiro", label: "Dinheiro", icon: Banknote },
  { value: "cartao_credito", label: "Cartão Crédito", icon: CreditCard },
  { value: "cartao_debito", label: "Cartão Débito", icon: Landmark },
];

export function PagamentoSidebar({
  pagamentos,
  totalComanda,
  isSubmitting,
  isAddingPagamento,
  removendoPagamentoId,
  podeRegistrarPagamento,
  onAddPagamento,
  onRemovePagamento,
  onConfirmar,
}: PagamentoSidebarProps) {
  const [formaSelecionada, setFormaSelecionada] = useState<FormaPagamento>("pix");
  const [valorDraftCents, setValorDraftCents] = useState(0);
  const [valorError, setValorError] = useState<string | undefined>();

  const totalComandaCents = toCents(totalComanda);
  const totalPagoCents = pagamentos.reduce((soma, pagamento) => soma + toCents(pagamento.valor), 0);
  const totalRestanteCents = Math.max(0, totalComandaCents - totalPagoCents);
  const trocoCents = Math.max(0, totalPagoCents - totalComandaCents);
  const isQuitado = totalPagoCents + 1 >= totalComandaCents;

  function handleAddPagamento() {
    if (valorDraftCents <= 0) {
      setValorError("Informe um valor válido maior que zero.");
      return;
    }

    setValorError(undefined);
    onAddPagamento(formaSelecionada, fromCents(valorDraftCents));
    setValorDraftCents(0);
  }

  return (
    <Card>
      <h2 className="text-base font-semibold text-slate-900 dark:text-white">Pagamento</h2>

      <div className="mt-4 flex flex-col gap-3">
        <div>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Forma de pagamento</span>
          <div className="mt-1.5 grid grid-cols-2 gap-2">
            {FORMAS.map((forma) => {
              const Icon = forma.icon;
              const isSelected = formaSelecionada === forma.value;
              return (
                <button
                  key={forma.value}
                  type="button"
                  onClick={() => setFormaSelecionada(forma.value)}
                  className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-2.5 text-xs font-medium transition-colors ${
                    isSelected
                      ? "border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {forma.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-end gap-2">
          <div className="flex-1">
            <CurrencyInput
              label="Valor (R$)"
              valueCents={valorDraftCents}
              onChangeCents={setValorDraftCents}
              error={valorError}
            />
          </div>
          <button
            type="button"
            onClick={handleAddPagamento}
            disabled={isAddingPagamento}
            aria-label="Adicionar lançamento de pagamento"
            className="flex h-[42px] shrink-0 items-center justify-center rounded-lg bg-slate-900 px-3 text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-700 dark:hover:bg-slate-600"
          >
            {isAddingPagamento ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          </button>
        </div>

        {pagamentos.length > 0 && (
          <ul className="flex flex-col gap-1.5">
            {pagamentos.map((pagamento) => (
              <li
                key={pagamento.id}
                className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800"
              >
                <span className="text-slate-700 dark:text-slate-300">{FORMA_PAGAMENTO_LABEL[pagamento.forma]}</span>
                <span className="flex items-center gap-2">
                  <span className="font-medium text-slate-900 dark:text-white">
                    {formatCurrency(pagamento.valor)}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemovePagamento(pagamento.id)}
                    disabled={removendoPagamentoId === pagamento.id}
                    aria-label="Remover lançamento"
                    className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60 dark:text-slate-500 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                  >
                    {removendoPagamentoId === pagamento.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-1.5 border-t border-slate-200 pt-4 text-sm dark:border-slate-800">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span>Total da Comanda</span>
          <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(totalComanda)}</span>
        </div>
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span>Total Pago</span>
          <span className="font-medium text-slate-900 dark:text-white">
            {formatCurrency(fromCents(totalPagoCents))}
          </span>
        </div>
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span>Total Restante</span>
          <span className="font-medium text-slate-900 dark:text-white">
            {formatCurrency(fromCents(totalRestanteCents))}
          </span>
        </div>
        {trocoCents > 0 && (
          <div
            data-testid="linha-troco"
            className="flex items-center justify-between rounded-lg bg-emerald-50 px-2.5 py-1.5 font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
          >
            <span className="flex items-center gap-1.5">
              <HandCoins className="h-4 w-4" />
              Troco
            </span>
            <span>{formatCurrency(fromCents(trocoCents))}</span>
          </div>
        )}
      </div>

      <div className="mt-4">
        {isQuitado ? (
          <span className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-50 py-2 text-sm font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4" />
            Pronto para Fechar
          </span>
        ) : (
          <span className="flex items-center justify-center gap-1.5 rounded-lg bg-red-50 py-2 text-sm font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-300">
            <AlertTriangle className="h-4 w-4" />
            Valor Insuficiente
          </span>
        )}
      </div>

      <Button
        onClick={onConfirmar}
        isLoading={isSubmitting}
        disabled={!podeRegistrarPagamento || !isQuitado || pagamentos.length === 0}
        className="mt-4 w-full"
      >
        <Send className="h-4 w-4" />
        Confirmar Fechamento e Quitar Comanda
      </Button>
    </Card>
  );
}
