import {
  AlertTriangle,
  Clock,
  MapPin,
  MessageSquareText,
  User,
} from "lucide-react";
import { NumeroDestaque } from "../../../components/ui/NumeroDestaque";
import { Selo } from "../../../components/ui/Selo";
import {
  formatarNumeroEntrega,
  resumoDosItens,
  seloDaCozinha,
  type TomDoTempo,
  tomDoTempo,
} from "../../../lib/expedicao";
import { FORMA_PAGAMENTO_LABEL } from "../../../lib/forma-pagamento";
import {
  formatCurrency,
  formatHora,
  formatTempoDecorrido,
} from "../../../lib/format";
import { STATUS_ITEM_LABEL } from "../../../lib/status-item";
import { CLASSES_DO_TOM } from "../../../lib/tons";
import type { EntregaPainel } from "../../../types/delivery";
import { AcoesEntrega, type HandlersAcoesEntrega } from "./AcoesEntrega";

interface EntregaCardProps extends HandlersAcoesEntrega {
  entrega: EntregaPainel;
  agora: Date;
  ocupada: boolean;
  // Abre o modal com o pedido completo (PED-130).
  onAbrir: (entrega: EntregaPainel) => void;
}

const CARD_POR_TOM: Record<TomDoTempo, string> = {
  neutro:
    "border border-slate-200 bg-white shadow-[0_1px_3px_rgb(0_0_0_/0.06)] dark:border-slate-800 dark:bg-slate-900 dark:shadow-none",
  alerta: `border-2 ${CLASSES_DO_TOM.aviso.superficie}`,
  critico: `border-2 ${CLASSES_DO_TOM.perigo.superficie}`,
};

const TEMPO_POR_TOM: Record<TomDoTempo, string> = {
  neutro: "text-slate-600 dark:text-slate-300",
  alerta: `font-semibold ${CLASSES_DO_TOM.aviso.texto}`,
  critico: `font-semibold ${CLASSES_DO_TOM.perigo.texto}`,
};

// Card de uma entrega no painel de expedição (PED-110, PED-137). Valores e troco vêm do
// backend. A parte de informações (com os produtos, PED-130) é um botão que abre o pedido
// completo; as ações ficam fora dele, para um clique nelas não abrir o modal.
export function EntregaCard({
  entrega,
  agora,
  ocupada,
  onAbrir,
  ...acoes
}: EntregaCardProps) {
  const tom = tomDoTempo(entrega, agora);
  const levarTroco =
    entrega.forma_pagamento_prevista === "dinheiro" &&
    entrega.troco > 0 &&
    entrega.troco_suficiente;
  const numero = formatarNumeroEntrega(entrega.numero_entrega);
  const selo = seloDaCozinha(entrega, (status) => STATUS_ITEM_LABEL[status]);
  const { visiveis, restantes } = resumoDosItens(entrega.itens);

  return (
    <article
      data-testid={`entrega-${entrega.numero_entrega}`}
      aria-label={`Entrega ${numero}`}
      className={`flex flex-col gap-3 rounded-2xl p-4 ${CARD_POR_TOM[tom]}`}
    >
      <button
        type="button"
        onClick={() => onAbrir(entrega)}
        aria-label={`Ver pedido ${numero}`}
        data-testid={`abrir-entrega-${entrega.numero_entrega}`}
        className="-m-2 flex flex-col gap-3 rounded-xl p-2 text-left text-corpo transition-colors hover:bg-slate-900/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-marca-600 dark:hover:bg-white/[0.04]"
      >
        <span className="flex w-full items-start justify-between gap-2">
          <NumeroDestaque>{numero}</NumeroDestaque>
          {selo && (
            <Selo
              tom="neutro"
              data-testid={`selo-cozinha-${entrega.numero_entrega}`}
            >
              {selo}
            </Selo>
          )}
        </span>

        <span className="flex flex-col gap-1 text-corpo">
          <span className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
            <User className="h-4 w-4 text-slate-400" />
            {entrega.cliente.nome}
          </span>
          <span className="flex items-start gap-1.5 text-slate-600 dark:text-slate-300">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <span>
              <span className="font-medium">{entrega.bairro}</span> ·{" "}
              {entrega.endereco_resumido}
            </span>
          </span>
          <span className={`flex items-start gap-1.5 ${TEMPO_POR_TOM[tom]}`}>
            <Clock className="mt-0.5 h-4 w-4 shrink-0" />
            {/* Um bloco de texto só: em coluna estreita, quebra como frase. */}
            <span>
              {formatTempoDecorrido(entrega.criado_em)}
              {entrega.previsao_entrega_em &&
                entrega.status_entrega !== "entregue" && (
                  <>
                    {" "}
                    · previsão {formatHora(entrega.previsao_entrega_em)}
                    {tom === "critico" && " · ATRASADA"}
                  </>
                )}
            </span>
          </span>
        </span>

        {visiveis.length > 0 && (
          <span
            className="flex w-full flex-col gap-1 border-t border-slate-900/10 pt-2 text-corpo dark:border-white/10"
            data-testid={`itens-entrega-${entrega.numero_entrega}`}
          >
            {visiveis.map((item) => (
              <span
                key={item.id}
                className="flex items-center gap-1.5 text-slate-800 dark:text-slate-100"
              >
                <span className="font-semibold tabular-nums">
                  {item.quantidade}×
                </span>
                <span className="truncate">{item.produto}</span>
                {item.tem_observacao && (
                  <Selo
                    tom="aviso"
                    icone={<MessageSquareText />}
                    title="Item com observação"
                    className="ml-auto"
                  >
                    obs.
                  </Selo>
                )}
              </span>
            ))}
            {restantes > 0 && (
              <span className="text-legenda font-medium text-slate-500 dark:text-slate-400">
                + {restantes} {restantes === 1 ? "item" : "itens"}
              </span>
            )}
          </span>
        )}

        <span className="flex w-full items-center justify-between border-t border-slate-900/10 pt-3 text-corpo dark:border-white/10">
          <span className="text-slate-600 dark:text-slate-300">
            {FORMA_PAGAMENTO_LABEL[entrega.forma_pagamento_prevista]}
          </span>
          <span className="flex items-center gap-2">
            {entrega.taxa_isenta && <Selo tom="andamento">Taxa isenta</Selo>}
            <span className="text-titulo-secao tabular-nums text-slate-900 dark:text-white">
              {formatCurrency(entrega.total)}
            </span>
          </span>
        </span>
      </button>

      {levarTroco && (
        <p
          className={`rounded-lg px-3 py-2 text-center text-corpo font-semibold uppercase tracking-wide ${CLASSES_DO_TOM.sucesso.seloForte}`}
        >
          Levar troco {formatCurrency(entrega.troco)}
        </p>
      )}

      {!entrega.troco_suficiente && (
        <p
          role="alert"
          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-corpo font-semibold ${CLASSES_DO_TOM.perigo.seloForte}`}
        >
          <AlertTriangle className="h-4 w-4 shrink-0" />
          Troco para menor que o total. Confirme com o cliente.
        </p>
      )}

      <AcoesEntrega entrega={entrega} ocupada={ocupada} {...acoes} />
    </article>
  );
}
