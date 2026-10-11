import { Minus, Plus, Trash2 } from "lucide-react";
import { formatCurrency } from "../../lib/format";
import type { AlteracaoItemCarrinho, ItemCarrinho } from "../../types/carrinho";

export interface OpcaoIntegrante {
  id: string;
  nome: string;
}

interface LinhaCarrinhoProps {
  item: ItemCarrinho;
  // Só na mesa. Sem integrantes (delivery), o seletor "Para quem?" não aparece.
  integrantes?: OpcaoIntegrante[];
  onAlterar: (id: string, alteracao: AlteracaoItemCarrinho) => void;
  onRemover: (id: string) => void;
}

// Um item do carrinho: quantidade, observação e (na mesa) para quem é. Usado pelo
// carrinho do garçom e pelo novo pedido delivery (PED-109).
export function LinhaCarrinho({ item, integrantes, onAlterar, onRemover }: LinhaCarrinhoProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-slate-900 dark:text-white">{item.produtoNome}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{formatCurrency(item.precoUnitario)} / un.</p>
        </div>
        <button
          type="button"
          onClick={() => onRemover(item.id)}
          aria-label={`Remover ${item.produtoNome} do pedido`}
          className="shrink-0 rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:text-slate-500 dark:hover:bg-red-950/40 dark:hover:text-red-400"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onAlterar(item.id, { quantidade: item.quantidade - 1 })}
          disabled={item.quantidade <= 1}
          aria-label={`Diminuir quantidade de ${item.produtoNome}`}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-300 text-slate-600 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-6 text-center text-sm font-semibold text-slate-900 dark:text-white">{item.quantidade}</span>
        <button
          type="button"
          onClick={() => onAlterar(item.id, { quantidade: item.quantidade + 1 })}
          aria-label={`Aumentar quantidade de ${item.produtoNome}`}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300"
        >
          <Plus className="h-4 w-4" />
        </button>
        <span className="ml-auto text-sm font-semibold text-slate-900 dark:text-white">
          {formatCurrency(item.precoUnitario * item.quantidade)}
        </span>
      </div>

      {integrantes && (
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-400">
          Para quem?
          <select
            value={item.integranteId ?? ""}
            onChange={(event) => onAlterar(item.id, { integranteId: event.target.value || null })}
            className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="">Compartilhado (toda a mesa)</option>
            {integrantes.map((integrante) => (
              <option key={integrante.id} value={integrante.id}>
                {integrante.nome}
              </option>
            ))}
          </select>
        </label>
      )}

      <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-400">
        Observação
        <input
          type="text"
          placeholder="Ex.: sem cebola"
          value={item.observacao}
          onChange={(event) => onAlterar(item.id, { observacao: event.target.value })}
          className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
        />
      </label>
    </div>
  );
}
