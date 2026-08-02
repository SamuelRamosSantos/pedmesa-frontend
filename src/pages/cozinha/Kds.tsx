import { ChefHat, LogOut, RefreshCw, UtensilsCrossed, Wifi, WifiOff } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { getApiErrorMessage } from "../../lib/api-error";
import { listPedidos, updatePedidoStatus } from "../../services/pedido.service";
import type { PedidoAtivo } from "../../types/pedido";
import { PedidoCard } from "./components/PedidoCard";
import { PROXIMA_ACAO } from "./status-flow";

const POLL_INTERVAL_MS = 8000;

type FiltroStatus = "todos" | "pendente" | "em_preparo" | "pronto";

const FILTROS: { value: FiltroStatus; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "pendente", label: "Pendentes" },
  { value: "em_preparo", label: "Em Preparo" },
  { value: "pronto", label: "Prontos" },
];

export function Kds() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [pedidos, setPedidos] = useState<PedidoAtivo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<FiltroStatus>("todos");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const isFirstLoadRef = useRef(true);

  const fetchPedidos = useCallback(async () => {
    setIsRefreshing(true);

    try {
      const data = await listPedidos();
      setPedidos(data);
      setIsConnected(true);
      setErrorMessage(null);
    } catch (error) {
      setIsConnected(false);

      if (isFirstLoadRef.current) {
        setErrorMessage(getApiErrorMessage(error, "Não foi possível carregar os pedidos."));
      }
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
      isFirstLoadRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchPedidos();
    const interval = setInterval(fetchPedidos, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchPedidos]);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  async function handleAvancarStatus(pedido: PedidoAtivo) {
    const acao = PROXIMA_ACAO[pedido.status_preparo];

    if (!acao) {
      return;
    }

    setUpdatingId(pedido.id);

    try {
      await updatePedidoStatus(pedido.id, acao.proximoStatus);

      if (acao.proximoStatus === "entregue") {
        setPedidos((current) => current.filter((item) => item.id !== pedido.id));
      } else {
        const proximoStatus = acao.proximoStatus;
        setPedidos((current) =>
          current.map((item) => (item.id === pedido.id ? { ...item, status_preparo: proximoStatus } : item))
        );
      }
    } catch (error) {
      showToast(getApiErrorMessage(error, "Não foi possível atualizar o status do pedido."), "error");
    } finally {
      setUpdatingId(null);
    }
  }

  const pedidosFiltrados =
    filtro === "todos" ? pedidos : pedidos.filter((pedido) => pedido.status_preparo === filtro);

  return (
    <div className="min-h-svh bg-slate-950 text-white">
      <header className="sticky top-0 z-20 flex flex-wrap items-center gap-3 border-b border-slate-800 bg-slate-900 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-600 text-white">
            <ChefHat className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400">PedMesa</p>
            <h1 className="text-lg font-bold text-white">Painel da Cozinha</h1>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-4">
          <span
            className={`flex items-center gap-1.5 text-xs font-semibold ${isConnected ? "text-emerald-400" : "text-red-400"}`}
          >
            {isConnected ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4 animate-pulse" />}
            {isConnected ? "Conectado" : "Sem conexão"}
          </span>

          <button
            type="button"
            onClick={fetchPedidos}
            aria-label="Atualizar pedidos"
            className="rounded-full p-2 text-slate-300 transition-colors hover:bg-slate-800"
          >
            <RefreshCw className={`h-5 w-5 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>

          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-white">{user?.nome}</p>
            <p className="text-xs uppercase tracking-wide text-slate-400">{user?.role}</p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-700"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </header>

      <div className="border-b border-slate-800 bg-slate-900/60 px-6 py-3">
        <div className="inline-flex gap-1 rounded-lg border border-slate-700 bg-slate-900 p-1">
          {FILTROS.map((opcao) => {
            const total =
              opcao.value === "todos"
                ? pedidos.length
                : pedidos.filter((pedido) => pedido.status_preparo === opcao.value).length;

            return (
              <button
                key={opcao.value}
                type="button"
                onClick={() => setFiltro(opcao.value)}
                className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
                  filtro === opcao.value ? "bg-orange-600 text-white" : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                {opcao.label} <span className="opacity-70">({total})</span>
              </button>
            );
          })}
        </div>
      </div>

      <main className="px-6 py-6">
        {isLoading && (
          <div className="flex flex-col items-center gap-3 py-16 text-slate-400">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <p className="text-sm">Carregando pedidos...</p>
          </div>
        )}

        {!isLoading && errorMessage && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-red-500/40 bg-red-950/30 p-6 text-center">
            <p className="text-sm text-red-300">{errorMessage}</p>
            <button
              type="button"
              onClick={fetchPedidos}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {!isLoading && !errorMessage && pedidosFiltrados.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-16 text-center text-slate-500">
            <UtensilsCrossed className="h-10 w-10" />
            <p className="text-sm">Nenhum pedido nessa fila no momento.</p>
          </div>
        )}

        {!isLoading && pedidosFiltrados.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {pedidosFiltrados.map((pedido) => (
              <PedidoCard
                key={pedido.id}
                pedido={pedido}
                isUpdating={updatingId === pedido.id}
                onAvancarStatus={handleAvancarStatus}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
