import { ArrowLeft, Ban, PartyPopper, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { ThemeToggle } from "../../components/ui/ThemeToggle";
import { useToast } from "../../contexts/ToastContext";
import { getApiErrorMessage } from "../../lib/api-error";
import { cancelarComanda, fecharComanda, getComandaExtrato } from "../../services/comanda.service";
import type { FormaPagamento } from "../../services/comanda.service";
import type { ComandaExtratoResumo } from "../../types/comanda";
import { IntegranteAccordion } from "./components/IntegranteAccordion";
import { PagamentoSidebar } from "./components/PagamentoSidebar";
import { ResumoFinanceiroCard } from "./components/ResumoFinanceiroCard";
import type { PagamentoLancado } from "./types";

export function ComandaFechamento() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [comanda, setComanda] = useState<ComandaExtratoResumo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [pagamentos, setPagamentos] = useState<PagamentoLancado[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nextPagamentoIdRef = useRef(1);
  const [isConfirmCancelOpen, setIsConfirmCancelOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchDados = useCallback(async () => {
    if (!id) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await getComandaExtrato(id);
      setComanda(data);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Não foi possível carregar o extrato da comanda."));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDados();
  }, [fetchDados]);

  function toggleExpanded(integranteId: string) {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(integranteId)) {
        next.delete(integranteId);
      } else {
        next.add(integranteId);
      }
      return next;
    });
  }

  function handleAddPagamento(forma: FormaPagamento, valor: number) {
    setPagamentos((current) => [...current, { id: nextPagamentoIdRef.current++, forma, valor }]);
  }

  function handleRemovePagamento(pagamentoId: number) {
    setPagamentos((current) => current.filter((pagamento) => pagamento.id !== pagamentoId));
  }

  async function handleConfirmar() {
    if (!id || pagamentos.length === 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const resultado = await fecharComanda(id, {
        pagamentos: pagamentos.map((pagamento) => ({ forma: pagamento.forma, valor: pagamento.valor })),
      });

      showToast(resultado.mensagem, "success");
      navigate("/caixa/mapa-mesas");
    } catch (error) {
      showToast(getApiErrorMessage(error, "Não foi possível fechar a comanda."), "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCancelarComandaZerada() {
    if (!id) {
      return;
    }

    setIsCancelling(true);

    try {
      const resultado = await cancelarComanda(id);
      showToast(resultado.mensagem, "success");
      navigate("/caixa/mapa-mesas");
    } catch (error) {
      showToast(getApiErrorMessage(error, "Não foi possível cancelar a comanda."), "error");
      setIsCancelling(false);
      setIsConfirmCancelOpen(false);
    }
  }

  const isComandaZerada = Boolean(
    comanda && comanda.status === "aberta" && comanda.resumo_financeiro.valor_total_comanda === 0
  );

  if (!id) {
    return <Navigate to="/caixa/mapa-mesas" replace />;
  }

  return (
    <div className="min-h-svh bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/caixa/mapa-mesas")}
            aria-label="Voltar ao mapa de mesas"
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Fechamento de Conta</p>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              {comanda ? `Mesa ${comanda.numero_comanda}` : "Carregando..."}
            </h1>
          </div>
          {comanda && (
            <span
              className={`ml-1 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                comanda.status === "aberta"
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                  : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              {comanda.status === "aberta" ? "Aberta" : "Fechada"}
            </span>
          )}
          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
            <button
              type="button"
              onClick={fetchDados}
              disabled={isLoading}
              aria-label="Atualizar extrato"
              className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <RefreshCw className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6">
        {isLoading && !comanda && (
          <div className="flex flex-col items-center gap-3 py-16 text-slate-400 dark:text-slate-500">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <p className="text-sm">Carregando extrato...</p>
          </div>
        )}

        {!isLoading && errorMessage && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950/30">
            <p className="text-sm text-red-700 dark:text-red-300">{errorMessage}</p>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => navigate("/caixa/mapa-mesas")}>
                Voltar ao mapa de mesas
              </Button>
              <Button variant="danger" onClick={fetchDados}>
                Tentar novamente
              </Button>
            </div>
          </div>
        )}

        {!errorMessage && comanda && (
          <div className="flex flex-col gap-4">
            {comanda.status !== "aberta" && (
              <div className="rounded-lg bg-slate-100 px-4 py-3 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                Esta comanda já foi fechada e não pode receber novos pagamentos.
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="flex flex-col gap-4 lg:col-span-2">
                <ResumoFinanceiroCard resumo={comanda.resumo_financeiro} />

                <div className="flex flex-col gap-3">
                  <h2 className="text-base font-semibold text-slate-900 dark:text-white">Divisão por Integrante</h2>

                  {comanda.divisao_por_integrante.length === 0 ? (
                    <p className="text-sm text-slate-400 dark:text-slate-500">
                      Nenhum integrante cadastrado nesta comanda.
                    </p>
                  ) : (
                    comanda.divisao_por_integrante.map((integrante) => (
                      <IntegranteAccordion
                        key={integrante.integrante_id}
                        integrante={integrante}
                        isExpanded={expandedIds.has(integrante.integrante_id)}
                        onToggle={() => toggleExpanded(integrante.integrante_id)}
                      />
                    ))
                  )}
                </div>
              </div>

              <div className="lg:col-span-1">
                {isComandaZerada ? (
                  <Card className="flex flex-col items-center gap-3 text-center lg:sticky lg:top-20">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                      <PartyPopper className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-slate-900 dark:text-white">Comanda Zerada</h2>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Esta mesa não teve nenhum pedido lançado. Você pode liberá-la agora sem gerar nenhum valor
                        financeiro.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsConfirmCancelOpen(true)}
                      data-testid="botao-cancelar-comanda-zerada"
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700"
                    >
                      <Ban className="h-4 w-4" />
                      Cancelar / Liberar Mesa
                    </button>
                  </Card>
                ) : (
                  <PagamentoSidebar
                    pagamentos={pagamentos}
                    totalComanda={comanda.resumo_financeiro.valor_total_comanda}
                    isSubmitting={isSubmitting}
                    podeRegistrarPagamento={comanda.status === "aberta"}
                    onAddPagamento={handleAddPagamento}
                    onRemovePagamento={handleRemovePagamento}
                    onConfirmar={handleConfirmar}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <ConfirmDialog
        isOpen={isConfirmCancelOpen}
        title="Cancelar comanda zerada?"
        description={`A Mesa ${comanda?.numero_comanda ?? ""} não possui nenhum pedido lançado. Ela será liberada imediatamente e nenhum valor será cobrado.`}
        confirmLabel="Sim, cancelar e liberar mesa"
        isConfirming={isCancelling}
        onCancel={() => setIsConfirmCancelOpen(false)}
        onConfirm={handleCancelarComandaZerada}
      />
    </div>
  );
}
