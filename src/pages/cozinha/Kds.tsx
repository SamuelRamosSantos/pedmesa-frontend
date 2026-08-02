import { CheckCircle2, ChefHat, Clock3, Flame, LogOut, RefreshCw, Wifi, WifiOff } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { getApiErrorMessage } from "../../lib/api-error";
import { listPedidos, updatePedidoStatus } from "../../services/pedido.service";
import type { PedidoAtivo, StatusPreparo } from "../../types/pedido";
import { KanbanColumn } from "./components/KanbanColumn";
import { COLUNAS_KANBAN, PROXIMA_ACAO, REGRESSAO_ACAO } from "./status-flow";

const POLL_INTERVAL_MS = 8000;

const COLUNA_VISUAL: Record<StatusPreparo, { icon: LucideIcon; headerClass: string }> = {
  pendente: { icon: Clock3, headerClass: "border-red-500/30 bg-red-950/30 text-red-300" },
  em_preparo: { icon: Flame, headerClass: "border-amber-500/30 bg-amber-950/20 text-amber-300" },
  pronto: { icon: CheckCircle2, headerClass: "border-emerald-500/30 bg-emerald-950/20 text-emerald-300" },
  entregue: { icon: CheckCircle2, headerClass: "border-slate-700 bg-slate-900 text-slate-300" },
};

export function Kds() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [pedidos, setPedidos] = useState<PedidoAtivo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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

  async function aplicarMudancaStatus(pedido: PedidoAtivo, novoStatus: StatusPreparo, mensagemErro: string) {
    setUpdatingId(pedido.id);

    try {
      await updatePedidoStatus(pedido.id, novoStatus);

      if (novoStatus === "entregue") {
        setPedidos((current) => current.filter((item) => item.id !== pedido.id));
      } else {
        setPedidos((current) =>
          current.map((item) => (item.id === pedido.id ? { ...item, status_preparo: novoStatus } : item))
        );
      }
    } catch (error) {
      showToast(getApiErrorMessage(error, mensagemErro), "error");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleAvancarStatus(pedido: PedidoAtivo) {
    const acao = PROXIMA_ACAO[pedido.status_preparo];

    if (!acao) {
      return;
    }

    await aplicarMudancaStatus(pedido, acao.proximoStatus, "Não foi possível atualizar o status do pedido.");
  }

  async function handleRegredirStatus(pedido: PedidoAtivo) {
    const acao = REGRESSAO_ACAO[pedido.status_preparo];

    if (!acao) {
      return;
    }

    await aplicarMudancaStatus(pedido, acao.proximoStatus, "Não foi possível desfazer o status do pedido.");
  }

  const pedidosPorStatus = useMemo(() => {
    const grupos: Record<StatusPreparo, PedidoAtivo[]> = {
      pendente: [],
      em_preparo: [],
      pronto: [],
      entregue: [],
    };

    for (const pedido of pedidos) {
      grupos[pedido.status_preparo]?.push(pedido);
    }

    for (const status of Object.keys(grupos) as StatusPreparo[]) {
      grupos[status].sort((a, b) => new Date(a.criado_em).getTime() - new Date(b.criado_em).getTime());
    }

    return grupos;
  }, [pedidos]);

  return (
    <div className="flex h-svh flex-col bg-slate-950 text-white">
      <header className="flex flex-wrap items-center gap-3 border-b border-slate-800 bg-slate-900 px-4 py-3 sm:px-6 sm:py-4">
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

      <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 md:overflow-hidden">
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

        {!isLoading && !errorMessage && (
          <div className="flex h-full flex-col gap-4 md:flex-row md:items-stretch">
            {COLUNAS_KANBAN.map((coluna) => (
              <KanbanColumn
                key={coluna.status}
                titulo={coluna.titulo}
                icon={COLUNA_VISUAL[coluna.status].icon}
                headerClass={COLUNA_VISUAL[coluna.status].headerClass}
                pedidos={pedidosPorStatus[coluna.status]}
                updatingId={updatingId}
                onAvancarStatus={handleAvancarStatus}
                onRegredirStatus={handleRegredirStatus}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
