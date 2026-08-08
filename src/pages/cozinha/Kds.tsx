import { CheckCircle2, Clock3, Flame, LayoutGrid, LogOut, RefreshCw, Wifi, WifiOff } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import logoIcon from "../../assets/logo-icon.svg";
import { ThemeToggle } from "../../components/ui/ThemeToggle";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { getApiErrorMessage } from "../../lib/api-error";
import { listPedidos, updateItemStatus } from "../../services/pedido.service";
import type { PedidoAtivo, StatusItem } from "../../types/pedido";
import { KanbanColumn } from "./components/KanbanColumn";
import { COLUNAS_KANBAN, PROXIMA_ACAO_ITEM, REGRESSAO_ACAO_ITEM } from "./status-flow";
import type { GrupoPreparo } from "./types";

const POLL_INTERVAL_MS = 8000;

const STATUS_FORA_DA_FILA: StatusItem[] = ["entregue", "cancelado"];

const COLUNA_VISUAL: Record<StatusItem, { icon: LucideIcon; headerClass: string }> = {
  pendente: {
    icon: Clock3,
    headerClass: "border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-950/30 dark:text-red-300",
  },
  em_preparo: {
    icon: Flame,
    headerClass:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-950/20 dark:text-amber-300",
  },
  pronto: {
    icon: CheckCircle2,
    headerClass:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-950/20 dark:text-emerald-300",
  },
  entregue: {
    icon: CheckCircle2,
    headerClass: "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300",
  },
  cancelado: {
    icon: CheckCircle2,
    headerClass: "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300",
  },
};

function calcularStatusGrupo(statusDosItens: StatusItem[]): StatusItem {
  if (statusDosItens.every((status) => status === "pendente")) {
    return "pendente";
  }

  if (statusDosItens.every((status) => status === "pronto")) {
    return "pronto";
  }

  return "em_preparo";
}

function montarGruposPreparo(pedidos: PedidoAtivo[]): GrupoPreparo[] {
  const grupos: GrupoPreparo[] = [];

  for (const pedido of pedidos) {
    const itensPreparo = pedido.itens.filter(
      (item) => item.precisa_preparo && !STATUS_FORA_DA_FILA.includes(item.status_item)
    );

    if (itensPreparo.length === 0) {
      continue;
    }

    grupos.push({
      pedidoId: pedido.id,
      numeroComanda: pedido.numero_comanda,
      garcomNome: pedido.garcom_nome,
      criadoEm: pedido.criado_em,
      statusGrupo: calcularStatusGrupo(itensPreparo.map((item) => item.status_item)),
      itens: itensPreparo.map((item) => ({
        id: item.id,
        produtoNome: item.produto_nome,
        quantidade: item.quantidade,
        integranteNome: item.integrante_nome,
        observacao: item.observacao,
      })),
    });
  }

  return grupos;
}

export function Kds() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [pedidos, setPedidos] = useState<PedidoAtivo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [updatingPedidoId, setUpdatingPedidoId] = useState<string | null>(null);
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

  function atualizarStatusItensLocal(pedidoId: string, itemIds: string[], novoStatus: StatusItem) {
    setPedidos((current) =>
      current.map((pedido) =>
        pedido.id !== pedidoId
          ? pedido
          : {
              ...pedido,
              itens: pedido.itens.map((item) =>
                itemIds.includes(item.id) ? { ...item, status_item: novoStatus } : item
              ),
            }
      )
    );
  }

  async function aplicarMudancaGrupo(grupo: GrupoPreparo, novoStatus: StatusItem, mensagemErro: string) {
    setUpdatingPedidoId(grupo.pedidoId);

    try {
      const resultados = await Promise.allSettled(
        grupo.itens.map((item) => updateItemStatus(item.id, novoStatus))
      );

      const itensComSucesso = grupo.itens
        .filter((_, index) => resultados[index].status === "fulfilled")
        .map((item) => item.id);

      if (itensComSucesso.length > 0) {
        atualizarStatusItensLocal(grupo.pedidoId, itensComSucesso, novoStatus);
      }

      if (resultados.some((resultado) => resultado.status === "rejected")) {
        showToast(mensagemErro, "error");
      }
    } finally {
      setUpdatingPedidoId(null);
    }
  }

  async function handleAvancar(grupo: GrupoPreparo) {
    const acao = PROXIMA_ACAO_ITEM[grupo.statusGrupo];

    if (!acao) {
      return;
    }

    await aplicarMudancaGrupo(grupo, acao.proximoStatus, "Não foi possível atualizar o status de alguns itens do pedido.");
  }

  async function handleRegredir(grupo: GrupoPreparo) {
    const acao = REGRESSAO_ACAO_ITEM[grupo.statusGrupo];

    if (!acao) {
      return;
    }

    await aplicarMudancaGrupo(grupo, acao.proximoStatus, "Não foi possível desfazer o status de alguns itens do pedido.");
  }

  const gruposPorStatus = useMemo(() => {
    const todosOsGrupos = montarGruposPreparo(pedidos);

    const colunas: Record<StatusItem, GrupoPreparo[]> = {
      pendente: [],
      em_preparo: [],
      pronto: [],
      entregue: [],
      cancelado: [],
    };

    for (const grupo of todosOsGrupos) {
      colunas[grupo.statusGrupo]?.push(grupo);
    }

    for (const status of Object.keys(colunas) as StatusItem[]) {
      colunas[status].sort((a, b) => new Date(a.criadoEm).getTime() - new Date(b.criadoEm).getTime());
    }

    return colunas;
  }, [pedidos]);

  return (
    <div className="flex h-svh flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <header className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-6 sm:py-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <img src={logoIcon} alt="PedMesa" className="h-11 w-11 rounded-xl" />
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">PedMesa</p>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">Painel da Cozinha</h1>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-4">
          <span
            className={`flex items-center gap-1.5 text-xs font-semibold ${isConnected ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}
          >
            {isConnected ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4 animate-pulse" />}
            {isConnected ? "Conectado" : "Sem conexão"}
          </span>

          {user && user.roles.length > 1 && (
            <button
              type="button"
              onClick={() => navigate("/selecionar-visao")}
              aria-label="Trocar visão"
              title="Trocar visão"
              className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <LayoutGrid className="h-5 w-5" />
            </button>
          )}

          <ThemeToggle />

          <button
            type="button"
            onClick={fetchPedidos}
            aria-label="Atualizar pedidos"
            className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <RefreshCw className={`h-5 w-5 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>

          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-slate-900 dark:text-white">{user?.nome}</p>
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {user?.roles.join(", ")}
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg bg-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-300 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 md:overflow-hidden">
        {isLoading && (
          <div className="flex flex-col items-center gap-3 py-16 text-slate-400 dark:text-slate-500">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <p className="text-sm">Carregando pedidos...</p>
          </div>
        )}

        {!isLoading && errorMessage && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-500/40 dark:bg-red-950/30">
            <p className="text-sm text-red-700 dark:text-red-300">{errorMessage}</p>
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
                grupos={gruposPorStatus[coluna.status]}
                updatingPedidoId={updatingPedidoId}
                onAvancar={handleAvancar}
                onRegredir={handleRegredir}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
