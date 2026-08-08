import { Printer, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useTenant } from "../../contexts/TenantContext";
import { formatCurrency, formatDataHora } from "../../lib/format";
import { getApiErrorMessage } from "../../lib/api-error";
import { getComandaExtrato } from "../../services/comanda.service";
import type { ComandaExtratoResumo } from "../../types/comanda";

export function PreContaImpressao() {
  const { id } = useParams<{ id: string }>();
  const { tenant } = useTenant();

  const [comanda, setComanda] = useState<ComandaExtratoResumo | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [geradoEm] = useState(() => new Date().toISOString());

  useEffect(() => {
    if (!id) {
      return;
    }

    getComandaExtrato(id)
      .then(setComanda)
      .catch((error) => setErrorMessage(getApiErrorMessage(error, "Não foi possível carregar a pré-conta.")));
  }, [id]);

  useEffect(() => {
    if (!comanda) {
      return;
    }

    const timeoutId = setTimeout(() => window.print(), 350);
    return () => clearTimeout(timeoutId);
  }, [comanda]);

  if (!id) {
    return <Navigate to="/caixa/mapa-mesas" replace />;
  }

  const itensPorIntegrante = comanda?.divisao_por_integrante.filter((integrante) => integrante.itens_individuais.length > 0) ?? [];
  const itensCompartilhados = comanda?.itens_compartilhados ?? [];

  return (
    <div className="min-h-svh bg-slate-100 py-6 print:bg-white print:py-0 dark:bg-slate-900">
      <div className="mx-auto flex max-w-sm flex-col gap-3 px-4 print:hidden">
        <div className="flex items-center justify-between">
          <Link to={`/caixa/comanda/${id}/fechamento`} className="text-sm font-medium text-slate-600 hover:underline dark:text-slate-300">
            ← Voltar ao fechamento
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900"
          >
            <Printer className="h-4 w-4" />
            Imprimir
          </button>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          A janela de impressão do navegador vai abrir automaticamente. Escolha a impressora térmica instalada no
          Windows ou "Salvar como PDF" para conferir o cupom.
        </p>
      </div>

      {errorMessage && (
        <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-700 print:hidden dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {errorMessage}
        </div>
      )}

      {!comanda && !errorMessage && (
        <div className="mt-10 flex flex-col items-center gap-3 text-slate-400 print:hidden">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <p className="text-sm">Carregando pré-conta...</p>
        </div>
      )}

      {comanda && (
        <div className="mx-auto mt-4 w-full max-w-xs bg-white p-4 font-mono text-[13px] leading-relaxed text-black print:mt-0 print:max-w-none print:p-0">
          <div className="text-center">
            <p className="font-bold">{tenant?.nome_fantasia ?? "PedMesa"}</p>
            <p className="mt-2">================================</p>
            <p className="font-bold">PRÉ-CONTA (NÃO FISCAL)</p>
            <p>apenas conferência de consumo</p>
            <p>================================</p>
          </div>

          <p className="mt-2">Comanda/Mesa: #{comanda.numero_comanda}</p>
          <p>Emitido em: {formatDataHora(geradoEm)}</p>
          <p>--------------------------------</p>

          {itensPorIntegrante.map((integrante) => (
            <div key={integrante.integrante_id} className="mt-2">
              <p className="font-bold">{integrante.nome}</p>
              {integrante.itens_individuais.map((item) => (
                <div key={item.id} className="flex justify-between gap-2">
                  <span>
                    {item.qtd}x {item.produto}
                  </span>
                  <span className="shrink-0">{formatCurrency(item.subtotal)}</span>
                </div>
              ))}
            </div>
          ))}

          {itensCompartilhados.length > 0 && (
            <div className="mt-2">
              <p className="font-bold">[COMPARTILHADO]</p>
              {itensCompartilhados.map((item) => (
                <div key={item.id} className="flex justify-between gap-2">
                  <span>
                    {item.qtd}x {item.produto}
                  </span>
                  <span className="shrink-0">{formatCurrency(item.subtotal)}</span>
                </div>
              ))}
            </div>
          )}

          <p className="mt-2">--------------------------------</p>
          <div className="flex justify-between font-bold">
            <span>TOTAL</span>
            <span>{formatCurrency(comanda.resumo_financeiro.valor_total_comanda)}</span>
          </div>
          <p>================================</p>

          <div className="mt-2 text-center">
            <p>Este cupom não possui valor fiscal.</p>
            <p>Aguarde o fechamento no caixa.</p>
          </div>
        </div>
      )}

      <style>{`
        @media print {
          @page { margin: 8mm; }
        }
      `}</style>
    </div>
  );
}
