import { AlertTriangle, Clock, Undo2, User } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { NumeroDestaque } from "../../../components/ui/NumeroDestaque";
import { Selo } from "../../../components/ui/Selo";
import { TipoAtendimento } from "../../../components/ui/TipoAtendimento";
import { formatHora, formatTempoDecorrido } from "../../../lib/format";
import { CLASSES_DO_TOM } from "../../../lib/tons";
import { PROXIMA_ACAO_ITEM, REGRESSAO_ACAO_ITEM } from "../status-flow";
import type { GrupoPreparo } from "../types";

interface GrupoPreparoCardProps {
  grupo: GrupoPreparo;
  isUpdating: boolean;
  onAvancar: (grupo: GrupoPreparo) => void;
  onRegredir: (grupo: GrupoPreparo) => void;
}

// Cartão do KDS no padrão do guia visual (PED-133): mesa e delivery com a mesma
// hierarquia, superfície neutra (o status já está no cabeçalho da coluna) e
// marcações de item consistentes.
export function GrupoPreparoCard({
  grupo,
  isUpdating,
  onAvancar,
  onRegredir,
}: GrupoPreparoCardProps) {
  const acao = PROXIMA_ACAO_ITEM[grupo.statusGrupo];
  const regressao = REGRESSAO_ACAO_ITEM[grupo.statusGrupo];

  return (
    <div
      data-testid={`grupo-preparo-${grupo.pedidoId}`}
      className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgb(0_0_0_/0.06)] dark:border-slate-800 dark:bg-slate-900 dark:shadow-none"
    >
      <div
        data-testid={`identificacao-${grupo.pedidoId}`}
        className="flex flex-col gap-1"
      >
        <TipoAtendimento
          tipo={grupo.identificacao.delivery ? "delivery" : "mesa"}
        />
        <NumeroDestaque>{grupo.identificacao.numero}</NumeroDestaque>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-legenda text-slate-600 dark:text-slate-300">
        <span className="flex items-center gap-1.5 font-medium">
          <Clock aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
          {formatTempoDecorrido(grupo.criadoEm)} · {formatHora(grupo.criadoEm)}
        </span>
        <span className="flex items-center gap-1.5">
          <User aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
          {grupo.garcomNome}
        </span>
      </div>

      <div className="flex flex-col gap-2.5 border-t border-slate-200 pt-3 dark:border-slate-800">
        {grupo.itens.map((item) => (
          <div key={item.id} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-titulo-secao tabular-nums text-slate-900 dark:text-white">
                {item.quantidade}x {item.produtoNome}
              </span>
              <Selo tom="neutro">
                {item.integranteNome
                  ? `Para: ${item.integranteNome}`
                  : "Compartilhado"}
              </Selo>
            </div>
            {item.observacao && (
              <div
                className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-corpo font-medium ${CLASSES_DO_TOM.aviso.superficie}`}
              >
                <AlertTriangle
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0"
                />
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
