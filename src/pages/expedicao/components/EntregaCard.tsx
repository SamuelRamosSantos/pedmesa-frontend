import {
  AlertTriangle,
  Ban,
  Clock,
  MapPin,
  Printer,
  Undo2,
  User,
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import {
  AVANCAR,
  aguardandoCozinha,
  formatarNumeroEntrega,
  podeCancelar,
  type TomDoTempo,
  tomDoTempo,
  VOLTAR,
} from "../../../lib/expedicao";
import { FORMA_PAGAMENTO_LABEL } from "../../../lib/forma-pagamento";
import {
  formatCurrency,
  formatHora,
  formatTempoDecorrido,
} from "../../../lib/format";
import { STATUS_ITEM_LABEL } from "../../../lib/status-item";
import type { EntregaPainel } from "../../../types/delivery";

interface EntregaCardProps {
  entrega: EntregaPainel;
  agora: Date;
  ocupada: boolean;
  onAvancar: (entrega: EntregaPainel) => void;
  onVoltar: (entrega: EntregaPainel) => void;
  onCancelar: (entrega: EntregaPainel) => void;
  onReimprimir: (entrega: EntregaPainel) => void;
}

const CARD_POR_TOM: Record<TomDoTempo, string> = {
  neutro: "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900",
  alerta:
    "border-amber-400 bg-amber-50 dark:border-amber-500/70 dark:bg-amber-950/20",
  critico: "border-red-500 bg-red-50 dark:border-red-500/80 dark:bg-red-950/30",
};

const TEMPO_POR_TOM: Record<TomDoTempo, string> = {
  neutro: "text-slate-600 dark:text-slate-300",
  alerta: "font-semibold text-amber-700 dark:text-amber-300",
  critico: "font-bold text-red-700 dark:text-red-300",
};

// Card de uma entrega no painel de expedição (PED-110). Valores e troco vêm do backend.
export function EntregaCard({
  entrega,
  agora,
  ocupada,
  onAvancar,
  onVoltar,
  onCancelar,
  onReimprimir,
}: EntregaCardProps) {
  const tom = tomDoTempo(entrega, agora);
  const avancar = AVANCAR[entrega.status_entrega];
  const voltar = VOLTAR[entrega.status_entrega];
  const esperandoCozinha = aguardandoCozinha(entrega);
  const levarTroco =
    entrega.forma_pagamento_prevista === "dinheiro" &&
    entrega.troco > 0 &&
    entrega.troco_suficiente;
  const numero = formatarNumeroEntrega(entrega.numero_entrega);

  return (
    <article
      data-testid={`entrega-${entrega.numero_entrega}`}
      aria-label={`Entrega ${numero}`}
      className={`flex flex-col gap-3 rounded-2xl border-2 p-4 shadow-sm ${CARD_POR_TOM[tom]}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-3xl font-extrabold leading-none text-slate-900 dark:text-white">
          {numero}
        </p>
        {entrega.status_entrega === "em_producao" && (
          <span className="rounded-full bg-slate-900/5 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-200">
            Cozinha: {STATUS_ITEM_LABEL[entrega.status_preparo]}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1 text-sm">
        <p className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
          <User className="h-4 w-4 text-slate-400" />
          {entrega.cliente.nome}
        </p>
        <p className="flex items-start gap-1.5 text-slate-600 dark:text-slate-300">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
          <span>
            <span className="font-medium">{entrega.bairro}</span> ·{" "}
            {entrega.endereco_resumido}
          </span>
        </p>
        <p className={`flex items-center gap-1.5 ${TEMPO_POR_TOM[tom]}`}>
          <Clock className="h-4 w-4" />
          {formatTempoDecorrido(entrega.criado_em)}
          {entrega.previsao_entrega_em &&
            entrega.status_entrega !== "entregue" && (
              <span>
                · previsão {formatHora(entrega.previsao_entrega_em)}
                {tom === "critico" && " · ATRASADA"}
              </span>
            )}
        </p>
      </div>

      <div className="flex items-center justify-between border-t border-slate-900/10 pt-3 text-sm dark:border-white/10">
        <span className="text-slate-600 dark:text-slate-300">
          {FORMA_PAGAMENTO_LABEL[entrega.forma_pagamento_prevista]}
        </span>
        <span className="flex items-center gap-2">
          {entrega.taxa_isenta && (
            <span className="whitespace-nowrap rounded-full bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-700 dark:bg-sky-950/50 dark:text-sky-300">
              Taxa isenta
            </span>
          )}
          <span className="text-lg font-bold text-slate-900 dark:text-white">
            {formatCurrency(entrega.total)}
          </span>
        </span>
      </div>

      {levarTroco && (
        <p className="rounded-lg bg-emerald-600 px-3 py-2 text-center text-sm font-extrabold uppercase tracking-wide text-white">
          Levar troco {formatCurrency(entrega.troco)}
        </p>
      )}

      {!entrega.troco_suficiente && (
        <p
          role="alert"
          className="flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white"
        >
          <AlertTriangle className="h-4 w-4 shrink-0" />
          Troco para menor que o total. Confirme com o cliente.
        </p>
      )}

      {entrega.status_entrega !== "entregue" && (
        <div className="flex flex-wrap items-center gap-2">
          {voltar && (
            <Button
              variant="secondary"
              onClick={() => onVoltar(entrega)}
              disabled={ocupada}
              aria-label={voltar.label}
              title={voltar.label}
              className="shrink-0 px-3"
            >
              <Undo2 className="h-4 w-4" />
            </Button>
          )}
          {avancar && (
            <Button
              onClick={() => onAvancar(entrega)}
              isLoading={ocupada}
              disabled={esperandoCozinha}
              title={
                esperandoCozinha
                  ? "Aguardando a cozinha terminar o preparo"
                  : undefined
              }
              className="flex-1"
            >
              {esperandoCozinha ? "Aguardando a cozinha" : avancar.label}
            </Button>
          )}
        </div>
      )}

      {entrega.status_entrega === "entregue" && voltar && (
        <Button
          variant="secondary"
          onClick={() => onVoltar(entrega)}
          disabled={ocupada}
          data-testid={`desfazer-entrega-${entrega.numero_entrega}`}
          className="w-full"
        >
          <Undo2 className="h-4 w-4" />
          {voltar.label}
        </Button>
      )}

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          onClick={() => onReimprimir(entrega)}
          className="whitespace-nowrap px-2.5 py-1.5 text-xs"
        >
          <Printer className="h-3.5 w-3.5" />
          Reimprimir ticket
        </Button>
        {podeCancelar(entrega.status_entrega) && (
          <Button
            variant="ghost"
            onClick={() => onCancelar(entrega)}
            disabled={ocupada}
            className="ml-auto px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
          >
            <Ban className="h-3.5 w-3.5" />
            Cancelar
          </Button>
        )}
      </div>
    </article>
  );
}
