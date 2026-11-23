import { Loader2, Receipt, Trash2 } from "lucide-react";
import { Fragment } from "react";
import { Card } from "../../../components/ui/Card";
import { Selo } from "../../../components/ui/Selo";
import { formatCurrency } from "../../../lib/format";
import { CLASSES_DO_TOM } from "../../../lib/tons";
import type {
  ExtratoIntegranteResumo,
  ExtratoItemCompartilhadoLinha,
} from "../../../types/comanda";

interface TodosItensCardProps {
  divisaoPorIntegrante: ExtratoIntegranteResumo[];
  itensCompartilhados: ExtratoItemCompartilhadoLinha[];
  podeExcluirItem: boolean;
  excluindoItemId: string | null;
  onExcluirItem: (itemId: string, produtoNome: string) => void;
  descontoPorItemId: Map<string, number>;
  mostrarColunaDesconto: boolean;
}

interface LinhaTodosItens {
  id: string;
  chave: string;
  produto: string;
  qtd: number;
  subtotal: number;
  pessoaNome: string | null;
  valorPorPessoa: number | null;
}

// Classes literais completas (não montadas em runtime) para o Tailwind conseguir
// detectar e gerar o CSS — grid-cols-[...] construído por concatenação de string
// não é reconhecido pelo scanner do Tailwind.
const GRID_COLS_CLASS: Record<string, string> = {
  "sem-desconto-sem-acao": "grid-cols-[1fr_auto_auto_auto]",
  "sem-desconto-com-acao": "grid-cols-[1fr_auto_auto_auto_auto]",
  "com-desconto-sem-acao": "grid-cols-[1fr_auto_auto_auto_auto]",
  "com-desconto-com-acao": "grid-cols-[1fr_auto_auto_auto_auto_auto]",
};

function DestinoBadge({ linha }: { linha: LinhaTodosItens }) {
  if (linha.pessoaNome) {
    return <Selo tom="neutro">{linha.pessoaNome}</Selo>;
  }

  return (
    <>
      <Selo tom="neutro">Compartilhado</Selo>
      {linha.valorPorPessoa !== null && (
        <span className="text-legenda text-slate-400 dark:text-slate-500">
          {formatCurrency(linha.valorPorPessoa)}/pessoa
        </span>
      )}
    </>
  );
}

export function TodosItensCard({
  divisaoPorIntegrante,
  itensCompartilhados,
  podeExcluirItem,
  excluindoItemId,
  onExcluirItem,
  descontoPorItemId,
  mostrarColunaDesconto,
}: TodosItensCardProps) {
  const linhas: LinhaTodosItens[] = [
    ...divisaoPorIntegrante.flatMap((integrante) =>
      integrante.itens_individuais.map((item) => ({
        id: item.id,
        chave: `individual-${item.id}`,
        produto: item.produto,
        qtd: item.qtd,
        subtotal: item.subtotal,
        pessoaNome: integrante.nome,
        valorPorPessoa: null,
      })),
    ),
    ...itensCompartilhados.map((item) => ({
      id: item.id,
      chave: `compartilhado-${item.id}`,
      produto: item.produto,
      qtd: item.qtd,
      subtotal: item.subtotal,
      pessoaNome: null,
      valorPorPessoa: item.valor_por_pessoa,
    })),
  ];

  if (linhas.length === 0) {
    return null;
  }

  const temDesconto = mostrarColunaDesconto;
  const gridColsClass =
    GRID_COLS_CLASS[
      `${temDesconto ? "com-desconto" : "sem-desconto"}-${podeExcluirItem ? "com-acao" : "sem-acao"}`
    ];

  return (
    <Card data-testid="card-todos-itens">
      <div className="flex items-center gap-2">
        <Receipt className="h-4 w-4 text-slate-400 dark:text-slate-500" />
        <h2 className="text-titulo-secao text-slate-900 dark:text-white">
          Todos os Itens
        </h2>
      </div>

      {/* Telas estreitas: cada item vira um cartão empilhado, evitando uma grade
          larga demais (nome do produto + qtd + valor + badge + lixeira não cabem
          numa linha só num celular). */}
      <div className="mt-4 flex flex-col gap-2 sm:hidden">
        {linhas.map((linha) => {
          const desconto = descontoPorItemId.get(linha.id) ?? 0;

          return (
            <div
              key={linha.chave}
              data-testid={`todos-itens-linha-${linha.chave}`}
              className="flex items-start justify-between gap-3 rounded-lg border border-slate-100 p-3 dark:border-slate-800"
            >
              <div className="min-w-0 flex-1">
                <p className="text-corpo font-medium text-slate-900 dark:text-white">
                  {linha.produto}
                </p>
                <p className="mt-0.5 text-legenda text-slate-500 dark:text-slate-400">
                  {linha.qtd}x · {formatCurrency(linha.subtotal)}
                  {temDesconto &&
                    desconto > 0 &&
                    ` · -${formatCurrency(desconto)}`}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <DestinoBadge linha={linha} />
                </div>
              </div>

              {podeExcluirItem && (
                <button
                  type="button"
                  onClick={() => onExcluirItem(linha.id, linha.produto)}
                  disabled={excluindoItemId === linha.id}
                  aria-label={`Excluir ${linha.produto}`}
                  title="Excluir item"
                  className="flex shrink-0 items-center justify-center rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-500 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                >
                  {excluindoItemId === linha.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* A partir de sm: grade tabular normal, com espaço de sobra para todas as colunas. */}
      <div className="mt-4 hidden overflow-x-auto sm:block">
        <div className={`grid ${gridColsClass} items-center gap-x-3 gap-y-2.5`}>
          <span className="text-legenda font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Produto
          </span>
          <span className="text-right text-legenda font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Qtd.
          </span>
          <span className="text-right text-legenda font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Valor Total
          </span>
          {temDesconto && (
            <span className="text-right text-legenda font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
              Desconto
            </span>
          )}
          <span className="text-right text-legenda font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Para
          </span>
          {podeExcluirItem && <span aria-hidden="true" />}

          {linhas.map((linha) => {
            const desconto = descontoPorItemId.get(linha.id) ?? 0;

            return (
              <Fragment key={linha.chave}>
                <span className="text-corpo text-slate-700 dark:text-slate-300">
                  {linha.produto}
                </span>
                <span className="text-right text-corpo text-slate-700 dark:text-slate-300">
                  {linha.qtd}
                </span>
                <span className="text-right text-corpo font-medium text-slate-700 dark:text-slate-300">
                  {formatCurrency(linha.subtotal)}
                </span>
                {temDesconto && (
                  <span
                    className={`text-right text-corpo ${CLASSES_DO_TOM.marca.texto}`}
                  >
                    {desconto > 0 ? `- ${formatCurrency(desconto)}` : "—"}
                  </span>
                )}
                <span className="flex flex-col items-end gap-0.5">
                  <DestinoBadge linha={linha} />
                </span>
                {podeExcluirItem && (
                  <button
                    type="button"
                    onClick={() => onExcluirItem(linha.id, linha.produto)}
                    disabled={excluindoItemId === linha.id}
                    aria-label={`Excluir ${linha.produto}`}
                    title="Excluir item"
                    className="flex shrink-0 items-center justify-center rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-500 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                  >
                    {excluindoItemId === linha.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                )}
              </Fragment>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
