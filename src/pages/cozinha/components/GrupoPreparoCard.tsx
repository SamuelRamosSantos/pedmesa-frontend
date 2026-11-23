import { AlertTriangle, Clock, Truck, Undo2, User } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Selo } from "../../../components/ui/Selo";
import { formatHora, formatTempoDecorrido } from "../../../lib/format";
import { STATUS_ITEM_LABEL, TOM_STATUS_ITEM } from "../../../lib/status-item";
import { CLASSES_DO_TOM } from "../../../lib/tons";
import { PROXIMA_ACAO_ITEM, REGRESSAO_ACAO_ITEM } from "../status-flow";
import type { GrupoPreparo } from "../types";

interface GrupoPreparoCardProps {
  grupo: GrupoPreparo;
  isUpdating: boolean;
  onAvancar: (grupo: GrupoPreparo) => void;
  onRegredir: (grupo: GrupoPreparo) => void;
}

// Cores do status pelo guia visual (PED-132). O redesenho do cartão é o PED-133.
export function GrupoPreparoCard({
  grupo,
  isUpdating,
  onAvancar,
  onRegredir,
}: GrupoPreparoCardProps) {
  const acao = PROXIMA_ACAO_ITEM[grupo.statusGrupo];
  const regressao = REGRESSAO_ACAO_ITEM[grupo.statusGrupo];
  const tom = TOM_STATUS_ITEM[grupo.statusGrupo];

  return (
    <div
      data-testid={`grupo-preparo-${grupo.pedidoId}`}
      className={`flex flex-col gap-3 rounded-2xl border-2 p-4 shadow-lg ${CLASSES_DO_TOM[tom].superficie}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div data-testid={`identificacao-${grupo.pedidoId}`}>
          {grupo.identificacao.delivery ? (
            <p className="inline-flex items-center gap-1.5 rounded-full bg-violet-600 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-white">
              <Truck aria-hidden="true" className="h-3.5 w-3.5" />
              {grupo.identificacao.rotulo}
            </p>
          ) : (
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {grupo.identificacao.rotulo}
            </p>
          )}
          <p
            className={`font-extrabold leading-none text-slate-900 dark:text-white ${
              grupo.identificacao.delivery ? "mt-1.5 text-4xl" : "text-5xl"
            }`}
          >
            {grupo.identificacao.numero}
          </p>
        </div>
        <Selo tom={tom} forte>
          {STATUS_ITEM_LABEL[grupo.statusGrupo]}
        </Selo>
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
            <Button
              onClick={() => onAvancar(grupo)}
              isLoading={isUpdating}
              className="flex-1"
            >
              {acao.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
