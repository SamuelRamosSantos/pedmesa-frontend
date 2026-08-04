import { Receipt } from "lucide-react";
import { Fragment } from "react";
import { Card } from "../../../components/ui/Card";
import { formatCurrency } from "../../../lib/format";
import type { ExtratoItemCompartilhadoLinha, ExtratoIntegranteResumo } from "../../../types/comanda";

interface TodosItensCardProps {
  divisaoPorIntegrante: ExtratoIntegranteResumo[];
  itensCompartilhados: ExtratoItemCompartilhadoLinha[];
}

interface LinhaTodosItens {
  chave: string;
  produto: string;
  qtd: number;
  subtotal: number;
  pessoaNome: string | null;
  valorPorPessoa: number | null;
}

export function TodosItensCard({ divisaoPorIntegrante, itensCompartilhados }: TodosItensCardProps) {
  const linhas: LinhaTodosItens[] = [
    ...divisaoPorIntegrante.flatMap((integrante) =>
      integrante.itens_individuais.map((item, index) => ({
        chave: `individual-${integrante.integrante_id}-${index}`,
        produto: item.produto,
        qtd: item.qtd,
        subtotal: item.subtotal,
        pessoaNome: integrante.nome,
        valorPorPessoa: null,
      }))
    ),
    ...itensCompartilhados.map((item, index) => ({
      chave: `compartilhado-${index}`,
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

  return (
    <Card data-testid="card-todos-itens">
      <div className="flex items-center gap-2">
        <Receipt className="h-4 w-4 text-slate-400 dark:text-slate-500" />
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Todos os Itens</h2>
      </div>

      <div className="mt-4 grid grid-cols-[1fr_auto_auto_auto] items-center gap-x-3 gap-y-2.5">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
          Produto
        </span>
        <span className="text-right text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
          Qtd.
        </span>
        <span className="text-right text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
          Valor Total
        </span>
        <span className="text-right text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
          Para
        </span>

        {linhas.map((linha) => (
          <Fragment key={linha.chave}>
            <span className="text-sm text-slate-700 dark:text-slate-300" data-testid={`todos-itens-linha-${linha.chave}`}>
              {linha.produto}
            </span>
            <span className="text-right text-sm text-slate-700 dark:text-slate-300">{linha.qtd}</span>
            <span className="text-right text-sm font-medium text-slate-700 dark:text-slate-300">
              {formatCurrency(linha.subtotal)}
            </span>
            <span className="flex flex-col items-end gap-0.5">
              {linha.pessoaNome ? (
                <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-bold uppercase text-orange-700 dark:bg-orange-500/20 dark:text-orange-300">
                  {linha.pessoaNome}
                </span>
              ) : (
                <>
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-bold uppercase text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
                    Compartilhado
                  </span>
                  {linha.valorPorPessoa !== null && (
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">
                      {formatCurrency(linha.valorPorPessoa)}/pessoa
                    </span>
                  )}
                </>
              )}
            </span>
          </Fragment>
        ))}
      </div>
    </Card>
  );
}
