import { Plus } from "lucide-react";
import { formatCurrency } from "../../lib/format";
import type { Produto } from "../../types/produto";
import { Selo } from "../ui/Selo";

interface ProdutoCardProps {
  produto: Produto;
  onAdd: (produto: Produto) => void;
}

export function ProdutoCard({ produto, onAdd }: ProdutoCardProps) {
  return (
    <div
      className={`flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_1px_3px_rgb(0_0_0_/0.06)] dark:border-slate-800 dark:bg-slate-900 dark:shadow-none ${
        produto.disponivel ? "" : "opacity-60"
      }`}
    >
      <div>
        <p className="line-clamp-2 text-corpo font-semibold text-slate-900 dark:text-white">
          {produto.nome}
        </p>
        {produto.descricao && (
          <p className="mt-0.5 line-clamp-2 text-legenda text-slate-500 dark:text-slate-400">
            {produto.descricao}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="text-corpo font-semibold tabular-nums text-slate-900 dark:text-white">
          {formatCurrency(produto.preco)}
        </span>

        {produto.disponivel ? (
          <button
            type="button"
            onClick={() => onAdd(produto)}
            aria-label={`Adicionar ${produto.nome} ao pedido`}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-marca-600 text-white transition-transform hover:bg-marca-700 active:scale-90"
          >
            <Plus className="h-4 w-4" />
          </button>
        ) : (
          <Selo tom="neutro">Esgotado</Selo>
        )}
      </div>
    </div>
  );
}
