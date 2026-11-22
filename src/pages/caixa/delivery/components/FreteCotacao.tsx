import { AlertTriangle, Ban, Clock, Loader2, Truck } from "lucide-react";
import { formatCurrency } from "../../../../lib/format";
import type { ControleCotacaoDelivery } from "../useCotacaoDelivery";

interface FreteCotacaoProps {
  cotacao: ControleCotacaoDelivery;
}

// Taxa e tempo estimado vindos do backend (PED-108). A UI só exibe.
export function FreteCotacao({ cotacao }: FreteCotacaoProps) {
  const { situacao } = cotacao;

  if (situacao === "sem_endereco") {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Informe o bairro e a cidade para calcular a entrega.
      </p>
    );
  }

  if (situacao === "calculando") {
    return (
      <p
        role="status"
        aria-live="polite"
        className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        Calculando a taxa de entrega...
      </p>
    );
  }

  if (situacao === "falhou") {
    return (
      <p
        role="status"
        className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400"
      >
        <AlertTriangle className="h-4 w-4" />
        Não foi possível calcular a taxa agora. Ela será conferida ao enviar o
        pedido.
      </p>
    );
  }

  if (situacao === "nao_atendido") {
    return (
      <p
        role="alert"
        className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
      >
        <Ban className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          {cotacao.bloqueio}{" "}
          <span className="font-normal">
            O pedido não pode ser enviado para este endereço.
          </span>
        </span>
      </p>
    );
  }

  const taxa = cotacao.cotacao?.taxa_entrega ?? 0;
  const tempo = cotacao.cotacao?.tempo_estimado_min ?? null;

  return (
    <div
      role="status"
      className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-slate-700 dark:text-slate-300"
    >
      <span className="flex items-center gap-2">
        <Truck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        Taxa de entrega:{" "}
        <strong className="text-slate-900 dark:text-white">
          {formatCurrency(taxa)}
        </strong>
        {cotacao.cotacao?.origem_taxa === "padrao" && (
          <span className="text-slate-500 dark:text-slate-400">
            (taxa padrão)
          </span>
        )}
      </span>
      {tempo !== null && (
        <span className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-slate-400" />
          Tempo estimado:{" "}
          <strong className="text-slate-900 dark:text-white">
            {tempo} min
          </strong>
        </span>
      )}
    </div>
  );
}
