import { Card } from "../../../components/ui/Card";
import { NumeroDestaque } from "../../../components/ui/NumeroDestaque";
import { formatCurrency } from "../../../lib/format";
import type { ResumoFinanceiro } from "../../../types/comanda";

interface ResumoFinanceiroCardProps {
  resumo: ResumoFinanceiro;
}

export function ResumoFinanceiroCard({ resumo }: ResumoFinanceiroCardProps) {
  return (
    <Card>
      <h2 className="text-titulo-secao text-slate-900 dark:text-white">
        Resumo Financeiro
      </h2>

      <dl className="mt-4 flex flex-col gap-2 text-corpo">
        <div className="flex items-center justify-between">
          <dt className="text-slate-500 dark:text-slate-400">
            Total de Itens Individuais
          </dt>
          <dd className="font-medium text-slate-900 dark:text-white">
            {formatCurrency(resumo.total_itens_individuais)}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-slate-500 dark:text-slate-400">
            Total de Itens Compartilhados
          </dt>
          <dd className="font-medium text-slate-900 dark:text-white">
            {formatCurrency(resumo.total_itens_compartilhados)}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-slate-500 dark:text-slate-400">
            Cota Compartilhada por Pessoa
          </dt>
          <dd className="font-medium text-slate-900 dark:text-white">
            {formatCurrency(resumo.valor_compartilhado_por_pessoa)} / integrante
          </dd>
        </div>
      </dl>

      <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-800">
        <span className="text-corpo font-medium text-slate-700 dark:text-slate-300">
          Valor Total da Comanda
        </span>
        <NumeroDestaque>
          {formatCurrency(resumo.valor_total_comanda)}
        </NumeroDestaque>
      </div>
    </Card>
  );
}
