import { AlertTriangle, Banknote, CheckCircle2, CreditCard, Landmark, Plus, QrCode, Send, Trash2 } from "lucide-react";
import { useState } from "react";
import type { ComponentType } from "react";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { formatCurrency } from "../../../lib/format";
import { fromCents, toCents } from "../../../lib/money";
import type { FormaPagamento } from "../../../services/comanda.service";
import type { PagamentoLancado } from "../types";

interface PagamentoSidebarProps {
  pagamentos: PagamentoLancado[];
  totalComanda: number;
  isSubmitting: boolean;
  podeRegistrarPagamento: boolean;
  onAddPagamento: (forma: FormaPagamento, valor: number) => void;
  onRemovePagamento: (id: number) => void;
  onConfirmar: () => void;
}

const FORMAS: { value: FormaPagamento; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { value: "pix", label: "Pix", icon: QrCode },
  { value: "dinheiro", label: "Dinheiro", icon: Banknote },
  { value: "cartao_credito", label: "Cartão Crédito", icon: CreditCard },
  { value: "cartao_debito", label: "Cartão Débito", icon: Landmark },
];

const FORMA_LABEL: Record<FormaPagamento, string> = {
  pix: "Pix",
  dinheiro: "Dinheiro",
  cartao_credito: "Cartão de Crédito",
  cartao_debito: "Cartão de Débito",
};

export function PagamentoSidebar({
  pagamentos,
  totalComanda,
  isSubmitting,
  podeRegistrarPagamento,
  onAddPagamento,
  onRemovePagamento,
  onConfirmar,
}: PagamentoSidebarProps) {
  const [formaSelecionada, setFormaSelecionada] = useState<FormaPagamento>("pix");
  const [valorDraft, setValorDraft] = useState("");
  const [valorError, setValorError] = useState<string | undefined>();

  const totalComandaCents = toCents(totalComanda);
  const totalPagoCents = pagamentos.reduce((soma, pagamento) => soma + toCents(pagamento.valor), 0);
  const totalRestanteCents = Math.max(0, totalComandaCents - totalPagoCents);
  const isQuitado = totalPagoCents + 1 >= totalComandaCents;

  function handleAddPagamento() {
    const valor = Number(valorDraft);

    if (!valorDraft || !Number.isFinite(valor) || valor <= 0) {
      setValorError("Informe um valor válido maior que zero.");
      return;
    }

    setValorError(undefined);
    onAddPagamento(formaSelecionada, valor);
    setValorDraft("");
  }

  return (
    <Card className="lg:sticky lg:top-20">
      <h2 className="text-base font-semibold text-slate-900">Pagamento</h2>

      <div className="mt-4 flex flex-col gap-3">
        <div>
          <span className="text-sm font-medium text-slate-700">Forma de pagamento</span>
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
                      ? "border-orange-500 bg-orange-50 text-orange-700"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {forma.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="valor-pagamento" className="text-sm font-medium text-slate-700">
            Valor (R$)
          </label>
          <div className="flex gap-2">
            <input
              id="valor-pagamento"
              type="number"
              inputMode="decimal"
              min={0}
              step={0.01}
              placeholder="0,00"
              value={valorDraft}
              onChange={(event) => setValorDraft(event.target.value)}
              className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 ${
                valorError
                  ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                  : "border-slate-300 focus:border-orange-500 focus:ring-orange-500/20"
              }`}
            />
            <button
              type="button"
              onClick={handleAddPagamento}
              aria-label="Adicionar lançamento de pagamento"
              className="flex shrink-0 items-center justify-center rounded-lg bg-slate-900 px-3 text-white hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          {valorError && <p className="text-sm text-red-600">{valorError}</p>}
        </div>

        {pagamentos.length > 0 && (
          <ul className="flex flex-col gap-1.5">
            {pagamentos.map((pagamento) => (
              <li
                key={pagamento.id}
                className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm"
              >
                <span className="text-slate-700">{FORMA_LABEL[pagamento.forma]}</span>
                <span className="flex items-center gap-2">
                  <span className="font-medium text-slate-900">{formatCurrency(pagamento.valor)}</span>
                  <button
                    type="button"
                    onClick={() => onRemovePagamento(pagamento.id)}
                    aria-label="Remover lançamento"
                    className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-1.5 border-t border-slate-200 pt-4 text-sm">
        <div className="flex items-center justify-between text-slate-500">
          <span>Total da Comanda</span>
          <span className="font-medium text-slate-900">{formatCurrency(totalComanda)}</span>
        </div>
        <div className="flex items-center justify-between text-slate-500">
          <span>Total Pago</span>
          <span className="font-medium text-slate-900">{formatCurrency(fromCents(totalPagoCents))}</span>
        </div>
        <div className="flex items-center justify-between text-slate-500">
          <span>Total Restante</span>
          <span className="font-medium text-slate-900">{formatCurrency(fromCents(totalRestanteCents))}</span>
        </div>
      </div>

      <div className="mt-4">
        {isQuitado ? (
          <span className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-50 py-2 text-sm font-semibold text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            Pronto para Fechar
          </span>
        ) : (
          <span className="flex items-center justify-center gap-1.5 rounded-lg bg-red-50 py-2 text-sm font-semibold text-red-700">
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
