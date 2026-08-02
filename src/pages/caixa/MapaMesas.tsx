import { Building2, ClipboardList, LogOut, Merge, RefreshCw, Search, Users } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { ThemeToggle } from "../../components/ui/ThemeToggle";
import { useAuth } from "../../contexts/AuthContext";
import { getApiErrorMessage } from "../../lib/api-error";
import { listComandas } from "../../services/comanda.service";
import { getTenantMe } from "../../services/tenant.service";
import type { ComandaListItem } from "../../types/comanda";
import type { Tenant } from "../../types/tenant";
import { JuntarComandasModal } from "./components/JuntarComandasModal";
import { MesaCard } from "./components/MesaCard";
import { StatCard } from "./components/StatCard";

type FiltroOcupacao = "todas" | "ocupadas" | "livres";

const OPCOES_FILTRO: { value: FiltroOcupacao; label: string }[] = [
  { value: "todas", label: "Todas" },
  { value: "ocupadas", label: "Apenas Ocupadas" },
  { value: "livres", label: "Apenas Livres" },
];

export function MapaMesas() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [comandas, setComandas] = useState<ComandaListItem[]>([]);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [filtro, setFiltro] = useState<FiltroOcupacao>("todas");
  const [searchTerm, setSearchTerm] = useState("");
  const [isJuntarModalOpen, setIsJuntarModalOpen] = useState(false);

  const fetchDados = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [comandasData, tenantData] = await Promise.all([listComandas(), getTenantMe()]);
      setComandas(comandasData);
      setTenant(tenantData);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Não foi possível carregar o mapa de mesas."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDados();
  }, [fetchDados]);

  const totalClientesAtendidos = useMemo(
    () => comandas.reduce((soma, comanda) => soma + comanda.total_integrantes, 0),
    [comandas]
  );

  const posicoes = useMemo(() => {
    if (!tenant) {
      return [];
    }

    const todas = Array.from({ length: tenant.quantidade_comandas }, (_, index) => {
      const numero = index + 1;
      const comanda = comandas.find((item) => item.numero_comanda === numero) ?? null;
      return { numero, comanda };
    });

    const porStatus = todas.filter((posicao) => {
      if (filtro === "ocupadas") {
        return posicao.comanda !== null;
      }
      if (filtro === "livres") {
        return posicao.comanda === null;
      }
      return true;
    });

    const termo = searchTerm.trim();

    if (!termo) {
      return porStatus;
    }

    return porStatus.filter((posicao) => String(posicao.numero).includes(termo));
  }, [tenant, comandas, filtro, searchTerm]);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  function handleMesaClick(comanda: ComandaListItem) {
    navigate(`/caixa/comanda/${comanda.id}/fechamento`);
  }

  function handleComandasJuntadas() {
    setIsJuntarModalOpen(false);
    fetchDados();
  }

  return (
    <div className="min-h-svh bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-600 text-white">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">PedMesa · Painel do Caixa</p>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">
              {tenant?.nome_fantasia ?? "Carregando..."}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            type="button"
            onClick={fetchDados}
            disabled={isLoading}
            aria-label="Atualizar mapa de mesas"
            className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <RefreshCw className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <div className="text-right">
            <p className="text-sm font-medium text-slate-900 dark:text-white">{user?.nome}</p>
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{user?.role}</p>
          </div>
          <Button variant="secondary" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6">
        {errorMessage ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950/30">
            <p className="text-sm text-red-700 dark:text-red-300">{errorMessage}</p>
            <Button variant="danger" onClick={fetchDados}>
              Tentar novamente
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatCard label="Comandas Abertas" value={comandas.length} icon={ClipboardList} />
              <StatCard label="Clientes Atendidos" value={totalClientesAtendidos} icon={Users} />
              <StatCard
                label="Capacidade Total de Comandas"
                value={tenant?.quantidade_comandas ?? "—"}
                icon={Building2}
              />
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex gap-1 rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
                {OPCOES_FILTRO.map((opcao) => (
                  <button
                    key={opcao.value}
                    type="button"
                    onClick={() => setFiltro(opcao.value)}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      filtro === opcao.value
                        ? "bg-orange-600 text-white"
                        : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    }`}
                  >
                    {opcao.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-slate-400" />
                  <label htmlFor="busca-mesa-caixa" className="sr-only">
                    Buscar mesa pelo número
                  </label>
                  <input
                    id="busca-mesa-caixa"
                    type="search"
                    inputMode="numeric"
                    placeholder="Buscar pelo número..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="w-48 rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
                  />
                </div>

                <Button
                  onClick={() => setIsJuntarModalOpen(true)}
                  disabled={comandas.length < 2}
                  title={comandas.length < 2 ? "É necessário ao menos 2 comandas abertas." : undefined}
                >
                  <Merge className="h-4 w-4" />
                  Juntar Comandas
                </Button>
              </div>
            </div>

            <div className="mt-6">
              {isLoading && posicoes.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-16 text-slate-400 dark:text-slate-500">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                  <p className="text-sm">Carregando mapa de mesas...</p>
                </div>
              ) : posicoes.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-16 text-center text-slate-400 dark:text-slate-500">
                  <p className="text-sm">Nenhuma mesa encontrada para os filtros selecionados.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
                  {posicoes.map((posicao) => (
                    <MesaCard
                      key={posicao.numero}
                      numero={posicao.numero}
                      comanda={posicao.comanda}
                      onClick={handleMesaClick}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <JuntarComandasModal
        isOpen={isJuntarModalOpen}
        comandas={comandas}
        onClose={() => setIsJuntarModalOpen(false)}
        onJoined={handleComandasJuntadas}
      />
    </div>
  );
}
