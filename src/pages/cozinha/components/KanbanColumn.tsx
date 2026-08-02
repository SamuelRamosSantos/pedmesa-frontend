import type { LucideIcon } from "lucide-react";
import type { PedidoAtivo } from "../../../types/pedido";
import { PedidoCard } from "./PedidoCard";

interface KanbanColumnProps {
  titulo: string;
  icon: LucideIcon;
  headerClass: string;
  pedidos: PedidoAtivo[];
  updatingId: string | null;
  onAvancarStatus: (pedido: PedidoAtivo) => void;
  onRegredirStatus: (pedido: PedidoAtivo) => void;
}

export function KanbanColumn({
  titulo,
  icon: Icon,
  headerClass,
  pedidos,
  updatingId,
  onAvancarStatus,
  onRegredirStatus,
}: KanbanColumnProps) {
  return (
    <section
      data-testid={`kanban-coluna-${titulo}`}
      className="flex min-w-0 flex-col rounded-2xl border border-slate-800 bg-slate-900/40 md:h-full md:min-h-0 md:flex-1"
    >
      <header className={`flex items-center gap-2 rounded-t-2xl border-b px-4 py-3 ${headerClass}`}>
        <Icon className="h-4 w-4" />
        <h2 className="text-sm font-bold uppercase tracking-wide">{titulo}</h2>
        <span className="ml-auto rounded-full bg-black/25 px-2.5 py-0.5 text-xs font-bold tabular-nums">
          {pedidos.length}
        </span>
      </header>

      <div className="flex flex-col gap-3 p-3 md:min-h-0 md:flex-1 md:overflow-y-auto">
        {pedidos.length === 0 && (
          <p className="py-8 text-center text-xs text-slate-500">Nenhum pedido nesta coluna.</p>
        )}

        {pedidos.map((pedido) => (
          <PedidoCard
            key={pedido.id}
            pedido={pedido}
            isUpdating={updatingId === pedido.id}
            onAvancarStatus={onAvancarStatus}
            onRegredirStatus={onRegredirStatus}
          />
        ))}
      </div>
    </section>
  );
}
