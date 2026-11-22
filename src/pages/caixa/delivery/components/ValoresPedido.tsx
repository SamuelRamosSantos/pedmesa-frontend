import { Loader2 } from "lucide-react";
import { formatCurrency } from "../../../../lib/format";
import type { ControleCotacaoDelivery } from "../useCotacaoDelivery";

function Linha({
  rotulo,
  valor,
  destaque = false,
}: {
  rotulo: string;
  valor: string;
  destaque?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between ${destaque ? "text-base font-bold text-slate-900 dark:text-white" : "text-sm text-slate-600 dark:text-slate-300"}`}
    >
      <span>{rotulo}</span>
      <span className="tabular-nums">{valor}</span>
    </div>
  );
}

const exibir = (valor: number | null | undefined) =>
  valor === null || valor === undefined ? "—" : formatCurrency(valor);

// Subtotal, taxa e total do pedido, sempre os da cotação do backend (PED-109).
export function ValoresPedido({
  cotacao,
}: {
  cotacao: ControleCotacaoDelivery;
}) {
  const valores = cotacao.cotacao;

  return (
    <div
      className="flex flex-col gap-1.5 border-t border-slate-200 pt-3 dark:border-slate-800"
      aria-live="polite"
    >
      {cotacao.situacao === "calculando" ? (
        <p className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          Calculando...
        </p>
      ) : (
        <>
          <Linha rotulo="Subtotal" valor={exibir(valores?.subtotal)} />
          <Linha
            rotulo="Taxa de entrega"
            valor={exibir(valores?.taxa_entrega)}
          />
          <Linha rotulo="Total" valor={exibir(valores?.total)} destaque />
        </>
      )}
    </div>
  );
}
