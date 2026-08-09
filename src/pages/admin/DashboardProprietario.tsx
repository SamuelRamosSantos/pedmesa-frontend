import { ClipboardCheck, History, Menu, PieChart, Receipt, RefreshCw, Wallet } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppShell } from "../../components/layout/AppShell";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { useTenant } from "../../contexts/TenantContext";
import { useToast } from "../../contexts/ToastContext";
import { FORMA_PAGAMENTO_LABEL } from "../../lib/forma-pagamento";
import { getApiErrorMessage } from "../../lib/api-error";
import { formatCurrency, formatDataHora } from "../../lib/format";
import { getDashboardResumo } from "../../services/dashboard.service";
import type { DashboardFiltro } from "../../services/dashboard.service";
import type { DashboardResumo, PeriodoDashboard } from "../../types/dashboard";
import { StatCard } from "../caixa/components/StatCard";

const OPCOES_PERIODO: { value: PeriodoDashboard; label: string }[] = [
  { value: "hoje", label: "Hoje" },
  { value: "7_dias", label: "7 dias" },
  { value: "30_dias", label: "30 dias" },
  { value: "customizado", label: "Personalizado" },
];

function hojeISO(): string {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

export function DashboardProprietario() {
  const { tenant } = useTenant();
  const { showToast } = useToast();

  const [periodo, setPeriodo] = useState<PeriodoDashboard>("hoje");
  const [dataInicioCustom, setDataInicioCustom] = useState(hojeISO());
  const [dataFimCustom, setDataFimCustom] = useState(hojeISO());

  const [resumo, setResumo] = useState<DashboardResumo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchDados = useCallback(async (filtro: DashboardFiltro) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await getDashboardResumo(filtro);
      setResumo(data);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Não foi possível carregar o dashboard."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDados({ periodo: "hoje" });
  }, [fetchDados]);

  function handleSelecionarPeriodo(novoPeriodo: PeriodoDashboard) {
    setPeriodo(novoPeriodo);

    if (novoPeriodo !== "customizado") {
      fetchDados({ periodo: novoPeriodo });
    }
  }

  function handleAplicarCustomizado() {
    if (!dataInicioCustom || !dataFimCustom) {
      showToast("Selecione a data de início e a data de fim.", "error");
      return;
    }

    if (dataInicioCustom > dataFimCustom) {
      showToast("A data de início não pode ser depois da data de fim.", "error");
      return;
    }

    fetchDados({ periodo: "customizado", data_inicio: dataInicioCustom, data_fim: dataFimCustom });
  }

  function handleRefresh() {
    if (periodo === "customizado") {
      handleAplicarCustomizado();
      return;
    }

    fetchDados({ periodo });
  }

  return (
    <AppShell>
      {({ openSidebar }) => (
        <>
          <header className="sticky top-0 z-10 flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-6 dark:border-slate-800 dark:bg-slate-900">
            <button
              type="button"
              onClick={openSidebar}
              aria-label="Abrir menu"
              className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">PedMesa · Dashboard</p>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                {tenant?.nome_fantasia ?? "Dashboard do Proprietário"}
              </h1>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={isLoading}
              aria-label="Atualizar dashboard"
              className="ml-auto rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <RefreshCw className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </header>

          <main className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6">
            <Card>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="inline-flex gap-1 rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
                  {OPCOES_PERIODO.map((opcao) => (
                    <button
                      key={opcao.value}
                      type="button"
                      onClick={() => handleSelecionarPeriodo(opcao.value)}
                      className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                        periodo === opcao.value
                          ? "bg-orange-600 text-white"
                          : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                      }`}
                    >
                      {opcao.label}
                    </button>
                  ))}
                </div>

                {periodo === "customizado" && (
                  <div className="flex flex-wrap items-end gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="dashboard-data-inicio" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Data início
                      </label>
                      <input
                        id="dashboard-data-inicio"
                        type="date"
                        value={dataInicioCustom}
                        onChange={(event) => setDataInicioCustom(event.target.value)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="dashboard-data-fim" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Data fim
                      </label>
                      <input
                        id="dashboard-data-fim"
                        type="date"
                        value={dataFimCustom}
                        onChange={(event) => setDataFimCustom(event.target.value)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                    <Button onClick={handleAplicarCustomizado} isLoading={isLoading}>
                      Aplicar
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {isLoading && !resumo && (
              <div className="flex flex-col items-center gap-3 py-16 text-slate-400 dark:text-slate-500">
                <RefreshCw className="h-6 w-6 animate-spin" />
                <p className="text-sm">Carregando dashboard...</p>
              </div>
            )}

            {!isLoading && errorMessage && (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950/30">
                <p className="text-sm text-red-700 dark:text-red-300">{errorMessage}</p>
                <Button variant="danger" onClick={handleRefresh}>
                  Tentar novamente
                </Button>
              </div>
            )}

            {!errorMessage && resumo && (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <StatCard
                    label={periodo === "hoje" ? "Faturamento do Dia" : "Faturamento do Período"}
                    value={formatCurrency(resumo.faturamento)}
                    icon={Wallet}
                  />
                  <StatCard label="Comandas Fechadas" value={resumo.comandas_fechadas} icon={ClipboardCheck} />
                  <StatCard label="Ticket Médio" value={formatCurrency(resumo.ticket_medio)} icon={Receipt} />
                </div>

                <Card>
                  <div className="flex items-center gap-2">
                    <PieChart className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <h2 className="text-base font-semibold text-slate-900 dark:text-white">Produtos Mais Pedidos</h2>
                  </div>

                  <div className="mt-4 h-72">
                    {resumo.produtos_mais_pedidos.length === 0 ? (
                      <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-slate-400 dark:text-slate-500">
                        <p className="text-sm">Nenhum produto vendido no período selecionado.</p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={resumo.produtos_mais_pedidos} margin={{ top: 8, right: 8, left: 8, bottom: 24 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                          <XAxis
                            dataKey="produto_nome"
                            tick={{ fontSize: 12, fill: "#94a3b8" }}
                            interval={0}
                            angle={-15}
                            textAnchor="end"
                            height={50}
                          />
                          <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                          <Tooltip
                            formatter={(value) => [`${value ?? 0}`, "Quantidade"]}
                            contentStyle={{ borderRadius: 8, fontSize: 13 }}
                          />
                          <Bar dataKey="quantidade" name="Quantidade" fill="#ea580c" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </Card>

                <Card>
                  <div className="flex items-center gap-2">
                    <History className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <h2 className="text-base font-semibold text-slate-900 dark:text-white">Histórico de Comandas Fechadas</h2>
                  </div>

                  <div className="mt-4 overflow-x-auto">
                    {resumo.historico_comandas.length === 0 ? (
                      <div className="flex flex-col items-center gap-2 py-10 text-center text-slate-400 dark:text-slate-500">
                        <p className="text-sm">Nenhuma comanda fechada no período selecionado.</p>
                      </div>
                    ) : (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                            <th className="py-2 pr-4">Data</th>
                            <th className="py-2 pr-4">Mesa</th>
                            <th className="py-2 pr-4 text-right">Valor</th>
                            <th className="py-2">Forma de Pagamento</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {resumo.historico_comandas.map((linha) => (
                            <tr key={linha.comanda_id}>
                              <td className="py-2.5 pr-4 text-slate-700 dark:text-slate-300">{formatDataHora(linha.fechada_em)}</td>
                              <td className="py-2.5 pr-4 text-slate-700 dark:text-slate-300">Mesa {linha.mesa}</td>
                              <td className="py-2.5 pr-4 text-right font-medium text-slate-900 dark:text-white">
                                {formatCurrency(linha.valor)}
                              </td>
                              <td className="py-2.5">
                                <div className="flex flex-wrap gap-1">
                                  {linha.formas_pagamento.map((forma) => (
                                    <span
                                      key={forma}
                                      className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                                    >
                                      {FORMA_PAGAMENTO_LABEL[forma]}
                                    </span>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </Card>
              </>
            )}
          </main>
        </>
      )}
    </AppShell>
  );
}
