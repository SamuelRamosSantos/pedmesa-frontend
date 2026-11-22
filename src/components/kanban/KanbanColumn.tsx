import type { LucideIcon } from "lucide-react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { type ReactNode, useId, useState } from "react";

interface KanbanColumnProps<T> {
  titulo: string;
  icon: LucideIcon;
  headerClass: string;
  itens: readonly T[];
  chave: (item: T) => string;
  renderCard: (item: T) => ReactNode;
  mensagemVazia?: string;
  // Coluna que começa fechada (ex.: "Entregues hoje" da expedição).
  recolhivel?: boolean;
}

// Coluna de Kanban genérica: o card vem por render prop. Usada pelo KDS e pelo painel de
// expedição (PED-110).
export function KanbanColumn<T>({
  titulo,
  icon: Icon,
  headerClass,
  itens,
  chave,
  renderCard,
  mensagemVazia = "Nenhum pedido nesta coluna.",
  recolhivel = false,
}: KanbanColumnProps<T>) {
  const [recolhida, setRecolhida] = useState(recolhivel);
  const listaId = useId();

  return (
    <section
      data-testid={`kanban-coluna-${titulo}`}
      className={`flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white md:h-full md:min-h-0 dark:border-slate-800 dark:bg-slate-900/40 ${
        recolhida ? "md:w-60 md:flex-none" : "md:flex-1"
      }`}
    >
      <header
        className={`flex items-center gap-2 rounded-t-2xl border-b px-4 py-3 ${headerClass} ${recolhida ? "rounded-b-2xl md:rounded-b-none" : ""}`}
      >
        <Icon className="h-4 w-4" />
        <h2 className="text-sm font-bold uppercase tracking-wide">{titulo}</h2>
        <span className="ml-auto rounded-full bg-black/10 px-2.5 py-0.5 text-xs font-bold tabular-nums dark:bg-black/25">
          {itens.length}
        </span>
        {recolhivel && (
          <button
            type="button"
            onClick={() => setRecolhida((atual) => !atual)}
            aria-expanded={!recolhida}
            aria-controls={listaId}
            aria-label={recolhida ? `Mostrar ${titulo}` : `Recolher ${titulo}`}
            className="rounded p-0.5 hover:bg-black/10 dark:hover:bg-white/10"
          >
            {recolhida ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        )}
      </header>

      {!recolhida && (
        <div
          id={listaId}
          className="flex flex-col gap-3 p-3 md:min-h-0 md:flex-1 md:overflow-y-auto"
        >
          {itens.length === 0 && (
            <p className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
              {mensagemVazia}
            </p>
          )}

          {itens.map((item) => (
            <div key={chave(item)}>{renderCard(item)}</div>
          ))}
        </div>
      )}
    </section>
  );
}
