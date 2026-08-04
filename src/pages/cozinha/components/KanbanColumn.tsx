import type { LucideIcon } from "lucide-react";
import type { GrupoPreparo } from "../types";
import { GrupoPreparoCard } from "./GrupoPreparoCard";

interface KanbanColumnProps {
  titulo: string;
  icon: LucideIcon;
  headerClass: string;
  grupos: GrupoPreparo[];
  updatingPedidoId: string | null;
  onAvancar: (grupo: GrupoPreparo) => void;
  onRegredir: (grupo: GrupoPreparo) => void;
}

export function KanbanColumn({
  titulo,
  icon: Icon,
  headerClass,
  grupos,
  updatingPedidoId,
  onAvancar,
  onRegredir,
}: KanbanColumnProps) {
  return (
    <section
      data-testid={`kanban-coluna-${titulo}`}
      className="flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white md:h-full md:min-h-0 md:flex-1 dark:border-slate-800 dark:bg-slate-900/40"
    >
      <header className={`flex items-center gap-2 rounded-t-2xl border-b px-4 py-3 ${headerClass}`}>
        <Icon className="h-4 w-4" />
        <h2 className="text-sm font-bold uppercase tracking-wide">{titulo}</h2>
        <span className="ml-auto rounded-full bg-black/10 px-2.5 py-0.5 text-xs font-bold tabular-nums dark:bg-black/25">
          {grupos.length}
        </span>
      </header>

      <div className="flex flex-col gap-3 p-3 md:min-h-0 md:flex-1 md:overflow-y-auto">
        {grupos.length === 0 && (
          <p className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">Nenhum pedido nesta coluna.</p>
        )}

        {grupos.map((grupo) => (
          <GrupoPreparoCard
            key={grupo.pedidoId}
            grupo={grupo}
            isUpdating={updatingPedidoId === grupo.pedidoId}
            onAvancar={onAvancar}
            onRegredir={onRegredir}
          />
        ))}
      </div>
    </section>
  );
}
