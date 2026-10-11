import { CheckCircle2, CookingPot, Menu, Package, Plus, RefreshCw, Truck, Wifi, WifiOff } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { KanbanColumn } from "../../components/kanban/KanbanColumn";
import { AppShell } from "../../components/layout/AppShell";
import { Button } from "../../components/ui/Button";
import { useToast } from "../../contexts/ToastContext";
import { usePolling } from "../../hooks/usePolling";
import { getApiErrorMessage, getApiErrorStatus } from "../../lib/api-error";
import {
  agruparPorColuna,
  aplicarEstado,
  aplicarStatusOtimista,
  AVANCAR,
  COLUNAS_EXPEDICAO,
  exigeMotivo,
  formatarNumeroEntrega,
  mesclarComPendentes,
  restaurarEntrega,
  VOLTAR,
  type StatusColuna,
} from "../../lib/expedicao";
import { listarEntregas, reimprimirTicketEntrega, transicionarEntrega } from "../../services/delivery.service";
import type { EntregaPainel, StatusEntrega } from "../../types/delivery";
import { EntregaCard } from "./components/EntregaCard";
import { MotivoModal } from "./components/MotivoModal";

const POLL_INTERVAL_MS = 8000;

const COLUNA_VISUAL: Record<StatusColuna, { icon: LucideIcon; headerClass: string }> = {
  em_producao: {
    icon: CookingPot,
    headerClass: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-950/20 dark:text-amber-300",
  },
  pronto_para_envio: {
    icon: Package,
    headerClass:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-950/20 dark:text-emerald-300",
  },
  em_rota: {
    icon: Truck,
    headerClass: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-950/20 dark:text-sky-300",
  },
  entregue: {
    icon: CheckCircle2,
    headerClass: "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300",
  },
};

interface TransicaoComMotivo {
  entrega: EntregaPainel;
  para: StatusEntrega;
}

// Painel Kanban de expedição (PED-110): acompanha os pedidos delivery do dia e move cada
// entrega pelos botões (sem drag-and-drop na v1). Toda transição leva a `versao` vista na
// tela; o backend recusa com 409 se outra pessoa mexeu antes.
export function Expedicao() {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [entregas, setEntregas] = useState<EntregaPainel[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [conectado, setConectado] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [ocupadas, setOcupadas] = useState<ReadonlySet<string>>(new Set());
  const [pedidoMotivo, setPedidoMotivo] = useState<TransicaoComMotivo | null>(null);
  const primeiraCargaRef = useRef(true);
  // Transições em andamento: o polling não desfaz o movimento otimista delas.
  const pendentesRef = useRef(new Set<string>());

  const carregar = useCallback(async () => {
    setAtualizando(true);

    try {
      const dados = await listarEntregas();
      setEntregas((locais) => mesclarComPendentes(dados, locais, pendentesRef.current));
      setConectado(true);
      setErro(null);
    } catch (error) {
      setConectado(false);

      if (primeiraCargaRef.current) {
        setErro(getApiErrorMessage(error, "Não foi possível carregar as entregas."));
      }
    } finally {
      setAtualizando(false);
      setCarregando(false);
      primeiraCargaRef.current = false;
    }
  }, []);

  usePolling(carregar, POLL_INTERVAL_MS);

  function marcarOcupada(id: string, ocupada: boolean) {
    setOcupadas((atuais) => {
      const proximas = new Set(atuais);
      if (ocupada) {
        proximas.add(id);
      } else {
        proximas.delete(id);
      }
      return proximas;
    });
  }

  async function transicionar(entrega: EntregaPainel, para: StatusEntrega, motivo: string | null): Promise<boolean> {
    pendentesRef.current.add(entrega.id);
    marcarOcupada(entrega.id, true);
    setEntregas((atuais) => aplicarStatusOtimista(atuais, entrega.id, para));

    try {
      const estado = await transicionarEntrega(entrega.id, { status: para, versao: entrega.versao, motivo });
      setEntregas((atuais) => aplicarEstado(atuais, estado));
      return true;
    } catch (error) {
      setEntregas((atuais) => restaurarEntrega(atuais, entrega));
      pendentesRef.current.delete(entrega.id);

      if (getApiErrorStatus(error) === 409) {
        showToast("Esta entrega foi atualizada por outra pessoa", "error");
        void carregar();
      } else {
        showToast(getApiErrorMessage(error, "Não foi possível atualizar a entrega."), "error");
      }

      return false;
    } finally {
      pendentesRef.current.delete(entrega.id);
      marcarOcupada(entrega.id, false);
    }
  }

  function pedirTransicao(entrega: EntregaPainel, para: StatusEntrega) {
    if (exigeMotivo(entrega.status_entrega, para)) {
      setPedidoMotivo({ entrega, para });
      return;
    }

    void transicionar(entrega, para, null);
  }

  async function confirmarComMotivo(motivo: string) {
    if (!pedidoMotivo) {
      return;
    }

    const { entrega, para } = pedidoMotivo;
    const ok = await transicionar(entrega, para, motivo);

    if (ok) {
      setPedidoMotivo(null);
      if (para === "cancelado") {
        showToast(`Entrega ${formatarNumeroEntrega(entrega.numero_entrega)} cancelada.`, "success");
      }
    }
  }

  async function reimprimir(entrega: EntregaPainel) {
    try {
      const { mensagem } = await reimprimirTicketEntrega(entrega.id);
      showToast(mensagem, "success");
    } catch (error) {
      showToast(getApiErrorMessage(error, "Não foi possível reimprimir o ticket."), "error");
    }
  }

  const colunas = useMemo(() => agruparPorColuna(entregas), [entregas]);
  const agora = new Date();
  const cancelando = pedidoMotivo?.para === "cancelado";

  return (
    <AppShell>
      {({ openSidebar }) => (
        <div className="flex h-svh flex-col text-slate-900 dark:text-white">
          <header className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-6 sm:py-4 dark:border-slate-800 dark:bg-slate-900">
            <button
              type="button"
              onClick={openSidebar}
              aria-label="Abrir menu"
              className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <h1 className="text-lg font-bold text-slate-900 dark:text-white">Painel de expedição</h1>

            <div className="ml-auto flex items-center gap-4">
              <span
                className={`flex items-center gap-1.5 text-xs font-semibold ${conectado ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}
              >
                {conectado ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4 animate-pulse" />}
                {conectado ? "Conectado" : "Sem conexão"}
              </span>

              <button
                type="button"
                onClick={() => void carregar()}
                aria-label="Atualizar entregas"
                className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <RefreshCw className={`h-5 w-5 ${atualizando ? "animate-spin" : ""}`} />
              </button>

              <Button onClick={() => navigate("/caixa/delivery/novo")}>
                <Plus className="h-4 w-4" />
                Novo pedido
              </Button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 md:overflow-hidden">
            {carregando && (
              <div className="flex flex-col items-center gap-3 py-16 text-slate-400 dark:text-slate-500">
                <RefreshCw className="h-6 w-6 animate-spin" />
                <p className="text-sm">Carregando entregas...</p>
              </div>
            )}

            {!carregando && erro && (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-500/40 dark:bg-red-950/30">
                <p className="text-sm text-red-700 dark:text-red-300">{erro}</p>
                <Button variant="danger" onClick={() => void carregar()}>
                  Tentar novamente
                </Button>
              </div>
            )}

            {!carregando && !erro && (
              <div className="flex h-full flex-col gap-4 md:flex-row md:items-stretch">
                {COLUNAS_EXPEDICAO.map((coluna) => (
                  <KanbanColumn
                    key={coluna.status}
                    titulo={coluna.titulo}
                    icon={COLUNA_VISUAL[coluna.status].icon}
                    headerClass={COLUNA_VISUAL[coluna.status].headerClass}
                    itens={colunas[coluna.status]}
                    chave={(entrega) => entrega.id}
                    recolhivel={coluna.recolhivel}
                    mensagemVazia="Nenhuma entrega nesta coluna."
                    renderCard={(entrega) => (
                      <EntregaCard
                        entrega={entrega}
                        agora={agora}
                        ocupada={ocupadas.has(entrega.id)}
                        onAvancar={(alvo) => {
                          const acao = AVANCAR[alvo.status_entrega];
                          if (acao) pedirTransicao(alvo, acao.para);
                        }}
                        onVoltar={(alvo) => {
                          const acao = VOLTAR[alvo.status_entrega];
                          if (acao) pedirTransicao(alvo, acao.para);
                        }}
                        onCancelar={(alvo) => pedirTransicao(alvo, "cancelado")}
                        onReimprimir={(alvo) => void reimprimir(alvo)}
                      />
                    )}
                  />
                ))}
              </div>
            )}
          </main>

          {pedidoMotivo && (
            <MotivoModal
              titulo={`${cancelando ? "Cancelar" : "Registrar retorno da"} entrega ${formatarNumeroEntrega(pedidoMotivo.entrega.numero_entrega)}`}
              descricao={
                cancelando
                  ? "Os itens serão cancelados e a comanda fechada sem cobrança. Informe o motivo."
                  : "A entrega volta para \"Pronto para envio\". Informe por que não foi entregue."
              }
              rotuloConfirmar={cancelando ? "Cancelar entrega" : "Registrar retorno"}
              perigo={cancelando}
              enviando={ocupadas.has(pedidoMotivo.entrega.id)}
              onConfirmar={(motivo) => void confirmarComMotivo(motivo)}
              onFechar={() => setPedidoMotivo(null)}
            />
          )}
        </div>
      )}
    </AppShell>
  );
}
