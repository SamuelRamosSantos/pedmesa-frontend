import { AlertTriangle, Clock, Undo2, User } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { formatHora, formatTempoDecorrido } from "../../../lib/format";
import { STATUS_ITEM_LABEL } from "../../../lib/status-item";
import type { StatusItem } from "../../../types/pedido";
import { PROXIMA_ACAO_ITEM, REGRESSAO_ACAO_ITEM } from "../status-flow";
import type { GrupoPreparo } from "../types";

interface GrupoPreparoCardProps {
  grupo: GrupoPreparo;
  isUpdating: boolean;
  onAvancar: (grupo: GrupoPreparo) => void;
  onRegredir: (grupo: GrupoPreparo) => void;
}

const STATUS_CARD_CLASS: Record<StatusItem, string> = {
  pendente: "border-red-300 bg-red-50 dark:border-red-500/70 dark:bg-red-950/30",
  em_preparo: "border-amber-300 bg-amber-50 dark:border-amber-500/70 dark:bg-amber-950/20",
  pronto: "border-emerald-300 bg-emerald-50 dark:border-emerald-500/70 dark:bg-emerald-950/20",
  entregue: "border-slate-300 bg-slate-100 dark:border-slate-700 dark:bg-slate-900",
  cancelado: "border-slate-300 bg-slate-100 dark:border-slate-700 dark:bg-slate-900",
};

const STATUS_BADGE_CLASS: Record<StatusItem, string> = {
  pendente: "bg-red-500 text-white",
  em_preparo: "bg-amber-500 text-slate-900",
  pronto: "bg-emerald-500 text-slate-900",
  entregue: "bg-slate-600 text-white",
  cancelado: "bg-slate-600 text-white",
};

export function GrupoPreparoCard({ grupo, isUpdating, onAvancar, onRegredir }: GrupoPreparoCardProps) {
  const acao = PROXIMA_ACAO_ITEM[grupo.statusGrupo];
  const regressao = REGRESSAO_ACAO_ITEM[grupo.statusGrupo];

  return (
    <div
      data-testid={`grupo-preparo-${grupo.pedidoId}`}
      className={`flex flex-col gap-3 rounded-2xl border-2 p-4 shadow-lg ${STATUS_CARD_CLASS[grupo.statusGrupo]}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Mesa</p>
          <p className="text-5xl font-extrabold leading-none text-slate-900 dark:text-white">
            {grupo.numeroComanda}
          </p>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold uppercase ${STATUS_BADGE_CLASS[grupo.statusGrupo]}`}
        >
          {STATUS_ITEM_LABEL[grupo.statusGrupo]}
        </span>
      </div>

      <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
        <span className="flex items-center gap-1.5 font-medium">
          <Clock className="h-4 w-4" />
          {formatTempoDecorrido(grupo.criadoEm)} · {formatHora(grupo.criadoEm)}
        </span>
        <span className="flex items-center gap-1.5">
          <User className="h-4 w-4" />
          {grupo.garcomNome}
        </span>
      </div>

      <div className="flex flex-col gap-2.5 border-t border-slate-900/10 pt-3 dark:border-white/10">
        {grupo.itens.map((item) => (
          <div key={item.id} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-lg font-semibold text-slate-900 dark:text-white">
                {item.quantidade}x {item.produtoNome}
              </span>
              {item.integranteNome ? (
                <span className="shrink-0 text-xs font-medium text-slate-600 dark:text-slate-300">
                  Para: {item.integranteNome}
                </span>
              ) : (
                <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-bold uppercase text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
                  Compartilhado
                </span>
              )}
            </div>
            {item.observacao && (
              <div className="flex items-center gap-1.5 rounded-lg bg-yellow-100 px-2.5 py-1.5 text-sm font-medium text-yellow-800 dark:bg-yellow-400/15 dark:text-yellow-300">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {item.observacao}
              </div>
            )}
          </div>
        ))}
      </div>

      {(acao || regressao) && (
        <div className="mt-1 flex items-center gap-2">
          {regressao && (
            <Button
              variant="secondary"
              onClick={() => onRegredir(grupo)}
              isLoading={isUpdating}
              aria-label={regressao.label}
              title={regressao.label}
              className="shrink-0 px-3"
            >
              <Undo2 className="h-4 w-4" />
            </Button>
          )}
          {acao && (
            <Button onClick={() => onAvancar(grupo)} isLoading={isUpdating} className="flex-1">
              {acao.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
