import { Plus } from "lucide-react";
import { formatCurrency } from "../../../lib/format";
import type { Produto } from "../../../types/produto";

interface ProdutoCardProps {
  produto: Produto;
  onAdd: (produto: Produto) => void;
}

export function ProdutoCard({ produto, onAdd }: ProdutoCardProps) {
  return (
    <div
      className={`flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm ${
        produto.disponivel ? "" : "opacity-60"
      }`}
    >
      <div>
        <p className="line-clamp-2 text-sm font-semibold text-slate-900">{produto.nome}</p>
        {produto.descricao && <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{produto.descricao}</p>}
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-bold text-slate-900">{formatCurrency(produto.preco)}</span>

        {produto.disponivel ? (
          <button
            type="button"
            onClick={() => onAdd(produto)}
            aria-label={`Adicionar ${produto.nome} ao pedido`}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-600 text-white transition-transform hover:bg-orange-700 active:scale-90"
          >
            <Plus className="h-4 w-4" />
          </button>
        ) : (
          <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
            Esgotado
          </span>
        )}
      </div>
    </div>
  );
}
