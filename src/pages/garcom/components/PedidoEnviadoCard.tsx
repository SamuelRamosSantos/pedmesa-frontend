import { AlertTriangle, CheckCircle2, Loader2, Undo2 } from "lucide-react";
import { formatHora, formatTempoDecorrido } from "../../../lib/format";
import type { PedidoAtivo, PedidoItemAtivo } from "../../../types/pedido";
import { STATUS_ITEM_BADGE_CLASS, STATUS_ITEM_LABEL } from "../status-item-flow";

interface PedidoEnviadoCardProps {
  pedido: PedidoAtivo;
  updatingItemId: string | null;
  onEntregarItem: (pedido: PedidoAtivo, item: PedidoItemAtivo) => void;
  onDesfazerEntrega: (pedido: PedidoAtivo, item: PedidoItemAtivo) => void;
}

export function PedidoEnviadoCard({
  pedido,
  updatingItemId,
  onEntregarItem,
  onDesfazerEntrega,
}: PedidoEnviadoCardProps) {
  return (
    <div
      data-testid={`pedido-enviado-${pedido.id}`}
      className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>
          {formatTempoDecorrido(pedido.criado_em)} · {formatHora(pedido.criado_em)}
        </span>
        <span>{pedido.garcom_nome}</span>
      </div>

      <div className="flex flex-col gap-2.5">
        {pedido.itens.map((item) => {
          const isUpdating = updatingItemId === item.id;

          return (
            <div
              key={item.id}
              data-testid={`item-enviado-${item.id}`}
              className="flex flex-col gap-2 rounded-xl border border-slate-100 p-3 dark:border-slate-800"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {item.quantidade}x {item.produto_nome}
                  </p>
                  {item.integrante_nome && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">Para: {item.integrante_nome}</p>
                  )}
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold uppercase ${STATUS_ITEM_BADGE_CLASS[item.status_item]}`}
                >
                  {STATUS_ITEM_LABEL[item.status_item]}
                </span>
              </div>

              {item.observacao && (
                <div className="flex items-center gap-1.5 rounded-lg bg-yellow-100 px-2.5 py-1.5 text-xs font-medium text-yellow-800 dark:bg-yellow-400/15 dark:text-yellow-300">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  {item.observacao}
                </div>
              )}

              {item.status_item === "pronto" && (
                <button
                  type="button"
                  onClick={() => onEntregarItem(pedido, item)}
                  disabled={isUpdating}
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  Marcar como Entregue
                </button>
              )}

              {item.status_item === "entregue" && (
                <button
                  type="button"
                  onClick={() => onDesfazerEntrega(pedido, item)}
                  disabled={isUpdating}
                  className="flex items-center justify-center gap-1.5 self-start rounded-lg px-2 py-1 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Undo2 className="h-3.5 w-3.5" />}
                  Desfazer entrega
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
