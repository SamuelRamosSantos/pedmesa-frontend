import { Send, X } from "lucide-react";
import { useEffect } from "react";
import { LinhaCarrinho } from "../../../components/carrinho/LinhaCarrinho";
import { Button } from "../../../components/ui/Button";
import type { ControleCarrinho } from "../../../hooks/useCarrinho";
import { formatCurrency } from "../../../lib/format";
import type { ExtratoIntegranteResumo } from "../../../types/comanda";

interface CartDrawerProps {
  isOpen: boolean;
  carrinho: ControleCarrinho;
  integrantes: ExtratoIntegranteResumo[];
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function CartDrawer({
  isOpen,
  carrinho,
  integrantes,
  isSubmitting,
  onClose,
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

  const opcoesIntegrante = integrantes.map((integrante) => ({
    id: integrante.integrante_id,
    nome: integrante.nome,
  }));

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: o clique no fundo só complementa o Escape e o botão de fechar
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/50"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Seu pedido"
        className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-t-3xl bg-white shadow-2xl dark:bg-slate-900"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <h2 className="text-titulo-secao text-slate-900 dark:text-white">
            Seu pedido
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          {carrinho.itens.length === 0 ? (
            <p className="py-8 text-center text-corpo text-slate-400 dark:text-slate-500">
              Nenhum item selecionado ainda.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {carrinho.itens.map((item) => (
                <LinhaCarrinho
                  key={item.id}
                  item={item}
                  integrantes={opcoesIntegrante}
                  onAlterar={carrinho.alterar}
                  onRemover={carrinho.remover}
                />
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 px-4 py-3 dark:border-slate-800">
          <div className="mb-3 flex items-center justify-between text-titulo-secao tabular-nums text-slate-900 dark:text-white">
            <span>Total</span>
            <span>{formatCurrency(carrinho.totalEstimado)}</span>
          </div>
          <Button
            onClick={onConfirm}
            isLoading={isSubmitting}
            disabled={carrinho.itens.length === 0}
            className="w-full"
          >
            <Send className="h-4 w-4" />
            Confirmar e Enviar Pedido
          </Button>
        </div>
      </div>
    </div>
  );
}
