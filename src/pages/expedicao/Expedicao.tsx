import type { LucideIcon } from "lucide-react";
import {
  CheckCircle2,
  CookingPot,
  Menu,
  Package,
  Plus,
  RefreshCw,
  Truck,
  Users,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { KanbanColumn } from "../../components/kanban/KanbanColumn";
import { AppShell } from "../../components/layout/AppShell";
import { Button } from "../../components/ui/Button";
import { useToast } from "../../contexts/ToastContext";
import { usePolling } from "../../hooks/usePolling";
import { getApiErrorMessage, getApiErrorStatus } from "../../lib/api-error";
import {
  AVANCAR,
  agruparPorColuna,
  aplicarEstado,
  aplicarStatusOtimista,
  COLUNAS_EXPEDICAO,
  exigeMotivo,
  formatarNumeroEntrega,
  mesclarComPendentes,
  restaurarEntrega,
  type StatusColuna,
  textosDoMotivo,
  VOLTAR,
} from "../../lib/expedicao";
import {
  listarEntregas,
  reimprimirTicketEntrega,
  transicionarEntrega,
} from "../../services/delivery.service";
import type { EntregaPainel, StatusEntrega } from "../../types/delivery";
import { DetalheEntregaModal } from "./components/DetalheEntregaModal";
import { EntregaCard } from "./components/EntregaCard";
import { MotivoModal } from "./components/MotivoModal";

const POLL_INTERVAL_MS = 8000;

const COLUNA_VISUAL: Record<
  StatusColuna,
  { icon: LucideIcon; headerClass: string }
> = {
  em_producao: {
    icon: CookingPot,
    headerClass:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-950/20 dark:text-amber-300",
  },
  pronto_para_envio: {
    icon: Package,
    headerClass:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-950/20 dark:text-emerald-300",
  },
  em_rota: {
    icon: Truck,
    headerClass:
      "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-950/20 dark:text-sky-300",
  },
  entregue: {
    icon: CheckCircle2,
    headerClass:
      "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300",
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
  const [pedidoMotivo, setPedidoMotivo] = useState<TransicaoComMotivo | null>(
    null,
  );
  // Entrega aberta no modal de detalhes (PED-130); o estado vem sempre da lista.
  const [detalheId, setDetalheId] = useState<string | null>(null);
  const primeiraCargaRef = useRef(true);
  // Transições em andamento: o polling não desfaz o movimento otimista delas.
  const pendentesRef = useRef(new Set<string>());

  const carregar = useCallback(async () => {
    setAtualizando(true);

    try {
      const dados = await listarEntregas();
      setEntregas((locais) =>
        mesclarComPendentes(dados, locais, pendentesRef.current),
      );
      setConectado(true);
      setErro(null);
    } catch (error) {
      setConectado(false);

      if (primeiraCargaRef.current) {
        setErro(
          getApiErrorMessage(error, "Não foi possível carregar as entregas."),
        );
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

  async function transicionar(
    entrega: EntregaPainel,
    para: StatusEntrega,
    motivo: string | null,
  ): Promise<boolean> {
    pendentesRef.current.add(entrega.id);
    marcarOcupada(entrega.id, true);
    setEntregas((atuais) => aplicarStatusOtimista(atuais, entrega.id, para));

    try {
      const estado = await transicionarEntrega(entrega.id, {
        status: para,
        versao: entrega.versao,
        motivo,
      });
      setEntregas((atuais) => aplicarEstado(atuais, estado));
      return true;
    } catch (error) {
      setEntregas((atuais) => restaurarEntrega(atuais, entrega));
      pendentesRef.current.delete(entrega.id);

      if (getApiErrorStatus(error) === 409) {
        showToast("Esta entrega foi atualizada por outra pessoa", "error");
        void carregar();
      } else {
        showToast(
          getApiErrorMessage(error, "Não foi possível atualizar a entrega."),
          "error",
        );
      }

      return false;
    } finally {
      pendentesRef.current.delete(entrega.id);
      marcarOcupada(entrega.id, false);
    }
  }

  function pedirTransicao(entrega: EntregaPainel, para: StatusEntrega) {
    if (exigeMotivo(entrega.status_entrega, para)) {
      // Um modal por vez: o de detalhes fecha e o do motivo abre (o Escape fecharia os dois).
      setDetalheId(null);
      setPedidoMotivo({ entrega, para });
      return;
    }

    void transicionar(entrega, para, null);
  }

  // As mesmas ações no card e no modal de detalhes (PED-130).
  const acoes = {
    onAvancar: (alvo: EntregaPainel) => {
      const acao = AVANCAR[alvo.status_entrega];
      if (acao) pedirTransicao(alvo, acao.para);
    },
    onVoltar: (alvo: EntregaPainel) => {
      const acao = VOLTAR[alvo.status_entrega];
      if (acao) pedirTransicao(alvo, acao.para);
    },
    onCancelar: (alvo: EntregaPainel) => pedirTransicao(alvo, "cancelado"),
    onReimprimir: (alvo: EntregaPainel) => void reimprimir(alvo),
  };

  // Fechar devolve o foco ao card que abriu o modal.
  function fecharDetalhe() {
    const numero = entregaDetalhe?.numero_entrega;
    setDetalheId(null);
    if (numero !== undefined) {
      requestAnimationFrame(() =>
        document
          .querySelector<HTMLButtonElement>(
            `[data-testid="abrir-entrega-${numero}"]`,
          )
          ?.focus(),
      );
    }
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
        showToast(
          `Entrega ${formatarNumeroEntrega(entrega.numero_entrega)} cancelada.`,
          "success",
        );
      }
    }
  }

  async function reimprimir(entrega: EntregaPainel) {
    try {
      const { mensagem } = await reimprimirTicketEntrega(entrega.id);
      showToast(mensagem, "success");
    } catch (error) {
      showToast(
        getApiErrorMessage(error, "Não foi possível reimprimir o ticket."),
        "error",
      );
    }
  }

  const colunas = useMemo(() => agruparPorColuna(entregas), [entregas]);
  const entregaDetalhe =
    detalheId === null
      ? null
      : (entregas.find((entrega) => entrega.id === detalheId) ?? null);
  const agora = new Date();
  const textosMotivo = pedidoMotivo
    ? textosDoMotivo(
        pedidoMotivo.entrega.status_entrega,
        pedidoMotivo.para,
        pedidoMotivo.entrega.numero_entrega,
      )
    : null;

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

            <h1 className="text-lg font-bold text-slate-900 dark:text-white">
              Painel de expedição
            </h1>

            {/* No celular, só ícones em "Conectado" e "Clientes": os quatro controles cabem em 375 px. */}
            <div className="ml-auto flex items-center gap-2 sm:gap-4">
              <span
                className={`flex items-center gap-1.5 text-xs font-semibold ${conectado ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}
              >
                {conectado ? (
                  <Wifi className="h-4 w-4" />
                ) : (
                  <WifiOff className="h-4 w-4 animate-pulse" />
                )}
                <span className="sr-only sm:not-sr-only">
                  {conectado ? "Conectado" : "Sem conexão"}
                </span>
              </span>

              <button
                type="button"
                onClick={() => void carregar()}
                aria-label="Atualizar entregas"
                className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <RefreshCw
                  className={`h-5 w-5 ${atualizando ? "animate-spin" : ""}`}
                />
              </button>

              <Button
                variant="secondary"
                onClick={() => navigate("/expedicao/clientes")}
                title="Clientes"
                className="px-3 sm:px-4"
              >
                <Users className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only">Clientes</span>
              </Button>

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
                        onAbrir={(alvo) => setDetalheId(alvo.id)}
                        {...acoes}
                      />
                    )}
                  />
                ))}
              </div>
            )}
          </main>

          {entregaDetalhe && (
            <DetalheEntregaModal
              entrega={entregaDetalhe}
              ocupada={ocupadas.has(entregaDetalhe.id)}
              onFechar={fecharDetalhe}
              {...acoes}
            />
          )}

          {pedidoMotivo && textosMotivo && (
            <MotivoModal
              titulo={textosMotivo.titulo}
              descricao={textosMotivo.descricao}
              rotuloConfirmar={textosMotivo.rotuloConfirmar}
              perigo={textosMotivo.perigo}
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
