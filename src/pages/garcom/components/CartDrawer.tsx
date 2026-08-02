import { Minus, Plus, Send, Trash2, X } from "lucide-react";
import { useEffect } from "react";
import { Button } from "../../../components/ui/Button";
import { formatCurrency } from "../../../lib/format";
import type { ExtratoIntegranteResumo } from "../../../types/comanda";
import type { CartItem } from "../types";

interface CartDrawerProps {
  isOpen: boolean;
  items: CartItem[];
  integrantes: ExtratoIntegranteResumo[];
  isSubmitting: boolean;
  onClose: () => void;
  onUpdateItem: (id: string, changes: Partial<Pick<CartItem, "quantidade" | "integranteId" | "observacao">>) => void;
  onRemoveItem: (id: string) => void;
  onConfirm: () => void;
}

export function CartDrawer({
  isOpen,
  items,
  integrantes,
  isSubmitting,
  onClose,
  onUpdateItem,
  onRemoveItem,
  onConfirm,
}: CartDrawerProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const total = items.reduce((soma, item) => soma + item.precoUnitario * item.quantidade, 0);

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/50"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Seu pedido"
        className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-t-3xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h2 className="text-lg font-semibold text-slate-900">Seu pedido</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          {items.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">Nenhum item selecionado ainda.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <div key={item.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-slate-900">{item.produtoNome}</p>
                      <p className="text-xs text-slate-500">{formatCurrency(item.precoUnitario)} / un.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      aria-label={`Remover ${item.produtoNome} do pedido`}
                      className="shrink-0 rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onUpdateItem(item.id, { quantidade: Math.max(1, item.quantidade - 1) })}
                      disabled={item.quantidade <= 1}
                      aria-label={`Diminuir quantidade de ${item.produtoNome}`}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-300 text-slate-600 disabled:opacity-40"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-6 text-center text-sm font-semibold text-slate-900">{item.quantidade}</span>
                    <button
                      type="button"
                      onClick={() => onUpdateItem(item.id, { quantidade: item.quantidade + 1 })}
                      aria-label={`Aumentar quantidade de ${item.produtoNome}`}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-300 text-slate-600"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <span className="ml-auto text-sm font-semibold text-slate-900">
                      {formatCurrency(item.precoUnitario * item.quantidade)}
                    </span>
                  </div>

                  <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
                    Para quem?
                    <select
                      value={item.integranteId ?? ""}
                      onChange={(event) => onUpdateItem(item.id, { integranteId: event.target.value || null })}
                      className="rounded-lg border border-slate-300 px-2.5 py-2 text-sm text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                    >
                      <option value="">Compartilhado (toda a mesa)</option>
                      {integrantes.map((integrante) => (
                        <option key={integrante.integrante_id} value={integrante.integrante_id}>
                          {integrante.nome}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
                    Observação
                    <input
                      type="text"
                      placeholder="Ex.: sem cebola"
                      value={item.observacao}
                      onChange={(event) => onUpdateItem(item.id, { observacao: event.target.value })}
                      className="rounded-lg border border-slate-300 px-2.5 py-2 text-sm text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                    />
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 px-4 py-3">
          <div className="mb-3 flex items-center justify-between text-base font-semibold text-slate-900">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
          <Button onClick={onConfirm} isLoading={isSubmitting} disabled={items.length === 0} className="w-full">
            <Send className="h-4 w-4" />
            Confirmar e Enviar Pedido
          </Button>
        </div>
      </div>
    </div>
  );
}
