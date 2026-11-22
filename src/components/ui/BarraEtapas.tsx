import { Check } from "lucide-react";

export interface EtapaDaBarra {
  id: string;
  rotulo: string;
}

interface BarraEtapasProps {
  etapas: readonly EtapaDaBarra[];
  // Índice da etapa aberta.
  atual: number;
  concluida: (indice: number) => boolean;
  // Etapas que podem ser abertas com um clique (as anteriores estão completas).
  liberada: (indice: number) => boolean;
  onIr: (indice: number) => void;
  rotulo: string;
}

// Barra de progresso de um assistente em etapas: um segmento por etapa, preenchido até a
// atual. As etapas liberadas viram botões para ir direto a elas.
export function BarraEtapas({
  etapas,
  atual,
  concluida,
  liberada,
  onIr,
  rotulo,
}: BarraEtapasProps) {
  return (
    <nav aria-label={rotulo}>
      <ol
        className="grid gap-2 sm:gap-3"
        style={{
          gridTemplateColumns: `repeat(${etapas.length}, minmax(0, 1fr))`,
        }}
      >
        {etapas.map((etapa, indice) => {
          const ativa = indice === atual;
          const feita = !ativa && concluida(indice);
          const clicavel = !ativa && liberada(indice);
          const preenchida = ativa || indice < atual || feita;

          const conteudo = (
            <>
              <span
                aria-hidden="true"
                className={`h-1.5 w-full rounded-full transition-colors ${
                  preenchida
                    ? "bg-orange-600"
                    : "bg-slate-200 dark:bg-slate-700"
                }`}
              />
              <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Etapa {indice + 1}
              </span>
              <span
                className={`flex items-center gap-1.5 truncate text-sm font-semibold ${
                  ativa
                    ? "text-orange-700 dark:text-orange-400"
                    : preenchida
                      ? "text-slate-900 dark:text-white"
                      : "text-slate-500 dark:text-slate-400"
                }`}
              >
                {feita && (
                  <Check aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                )}
                {etapa.rotulo}
                {feita && <span className="sr-only">(concluída)</span>}
              </span>
            </>
          );

          return (
            <li key={etapa.id} className="min-w-0">
              {clicavel ? (
                <button
                  type="button"
                  onClick={() => onIr(indice)}
                  data-testid={`etapa-${etapa.id}`}
                  className="flex w-full flex-col gap-1 rounded-md text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-600"
                >
                  {conteudo}
                </button>
              ) : (
                <div
                  aria-current={ativa ? "step" : undefined}
                  data-testid={`etapa-${etapa.id}`}
                  className="flex flex-col gap-1"
                >
                  {conteudo}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
