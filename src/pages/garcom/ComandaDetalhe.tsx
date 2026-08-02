import {
  ArrowLeft,
  Ban,
  ClipboardList,
  RefreshCw,
  Search,
  ShoppingCart,
  UserPlus,
  UtensilsCrossed,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { ThemeToggle } from "../../components/ui/ThemeToggle";
import { useToast } from "../../contexts/ToastContext";
import { getApiErrorMessage } from "../../lib/api-error";
import { formatCurrency } from "../../lib/format";
import { listCategorias } from "../../services/categoria.service";
import { cancelarComanda, getComandaExtrato } from "../../services/comanda.service";
import { createPedido, listPedidos, updateItemStatus } from "../../services/pedido.service";
import { listProdutos } from "../../services/produto.service";
import type { Categoria } from "../../types/categoria";
import type { ComandaExtratoResumo, Integrante } from "../../types/comanda";
import type { PedidoAtivo, PedidoItemAtivo, StatusItem } from "../../types/pedido";
import type { Produto } from "../../types/produto";
import { AddIntegranteModal } from "./components/AddIntegranteModal";
import { CartDrawer } from "./components/CartDrawer";
import { PedidoEnviadoCard } from "./components/PedidoEnviadoCard";
import { PedidosResumoBar } from "./components/PedidosResumoBar";
import { ProdutoCard } from "./components/ProdutoCard";
import type { FiltroStatusPedido } from "./status-item-flow";
import { statusItemPassaFiltro } from "./status-item-flow";
import type { CartItem } from "./types";

type AbaComandaDetalhe = "cardapio" | "pedidos";
const POLL_PEDIDOS_INTERVAL_MS = 8000;

export function ComandaDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [comanda, setComanda] = useState<ComandaExtratoResumo | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [pedidos, setPedidos] = useState<PedidoAtivo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [abaAtiva, setAbaAtiva] = useState<AbaComandaDetalhe>("cardapio");
  const [filtroStatusPedidos, setFiltroStatusPedidos] = useState<FiltroStatusPedido>("todos");
  const [selectedCategoriaId, setSelectedCategoriaId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSubmittingPedido, setIsSubmittingPedido] = useState(false);
  const [isAddIntegranteOpen, setIsAddIntegranteOpen] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [isConfirmCancelOpen, setIsConfirmCancelOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchDados = useCallback(async () => {
    if (!id) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [comandaData, categoriasData, produtosData, pedidosData] = await Promise.all([
        getComandaExtrato(id),
        listCategorias(),
        listProdutos(),
        listPedidos(),
      ]);

      setComanda(comandaData);
      setCategorias(categoriasData);
      setProdutos(produtosData);
      setPedidos(pedidosData.filter((pedido) => pedido.comanda_id === id));
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Não foi possível carregar a comanda."));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDados();
  }, [fetchDados]);

  const fetchPedidosSilencioso = useCallback(async () => {
    if (!id) {
      return;
    }

    try {
      const data = await listPedidos();
      setPedidos(data.filter((pedido) => pedido.comanda_id === id));
    } catch {
      // Polling silencioso: uma falha pontual não deve interromper o fluxo do garçom.
    }
  }, [id]);

  useEffect(() => {
    if (abaAtiva !== "pedidos") {
      return;
    }

    fetchPedidosSilencioso();
    const interval = setInterval(fetchPedidosSilencioso, POLL_PEDIDOS_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [abaAtiva, fetchPedidosSilencioso]);

  const produtosFiltrados = useMemo(() => {
    const termo = searchTerm.trim().toLowerCase();

    return produtos
      .filter((produto) => !selectedCategoriaId || produto.categoria_id === selectedCategoriaId)
      .filter((produto) => !termo || produto.nome.toLowerCase().includes(termo))
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }, [produtos, selectedCategoriaId, searchTerm]);

  const cartTotal = useMemo(
    () => cart.reduce((soma, item) => soma + item.precoUnitario * item.quantidade, 0),
    [cart]
  );
  const cartCount = useMemo(() => cart.reduce((soma, item) => soma + item.quantidade, 0), [cart]);

  const pedidosOrdenados = useMemo(
    () => [...pedidos].sort((a, b) => new Date(a.criado_em).getTime() - new Date(b.criado_em).getTime()),
    [pedidos]
  );

  const contagensPorStatus = useMemo(() => {
    const contagens: Partial<Record<StatusItem, number>> = {};

    for (const pedido of pedidosOrdenados) {
      for (const item of pedido.itens) {
        contagens[item.status_item] = (contagens[item.status_item] ?? 0) + 1;
      }
    }

    return contagens;
  }, [pedidosOrdenados]);

  const totalProntosParaEntregar = contagensPorStatus.pronto ?? 0;

  const pedidosFiltrados = useMemo(() => {
    return pedidosOrdenados
      .map((pedido) => ({
        ...pedido,
        itens: pedido.itens.filter((item) => statusItemPassaFiltro(item.status_item, filtroStatusPedidos)),
      }))
      .filter((pedido) => pedido.itens.length > 0);
  }, [pedidosOrdenados, filtroStatusPedidos]);

  const isComandaZerada = Boolean(
    comanda && comanda.status === "aberta" && comanda.resumo_financeiro.valor_total_comanda === 0
  );

  function handleAddToCart(produto: Produto) {
    setCart((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        produtoId: produto.id,
        produtoNome: produto.nome,
        precoUnitario: produto.preco,
        quantidade: 1,
        integranteId: null,
        observacao: "",
      },
    ]);
  }

  function handleUpdateCartItem(
    itemId: string,
    changes: Partial<Pick<CartItem, "quantidade" | "integranteId" | "observacao">>
  ) {
    setCart((current) => current.map((item) => (item.id === itemId ? { ...item, ...changes } : item)));
  }

  function handleRemoveCartItem(itemId: string) {
    setCart((current) => current.filter((item) => item.id !== itemId));
  }

  function handleIntegranteAdicionado(integrante: Integrante) {
    setComanda((current) =>
      current
        ? {
            ...current,
            divisao_por_integrante: [
              ...current.divisao_por_integrante,
              {
                integrante_id: integrante.id,
                nome: integrante.nome,
                itens_individuais: [],
                total_individual: 0,
                cota_compartilhada: 0,
                total_a_pagar: 0,
              },
            ],
          }
        : current
    );
  }

  async function handleConfirmarPedido() {
    if (!id || cart.length === 0) {
      return;
    }

    setIsSubmittingPedido(true);

    try {
      const resultado = await createPedido(id, {
        itens: cart.map((item) => ({
          produto_id: item.produtoId,
          integrante_id: item.integranteId,
          quantidade: item.quantidade,
          observacao: item.observacao.trim() || null,
        })),
      });

      showToast(resultado.mensagem, "success");
      setCart([]);
      setIsCartOpen(false);
      fetchDados();
    } catch (error) {
      showToast(getApiErrorMessage(error, "Não foi possível enviar o pedido. Tente novamente."), "error");
    } finally {
      setIsSubmittingPedido(false);
    }
  }

  function atualizarStatusItemLocal(pedidoId: string, itemId: string, novoStatus: PedidoItemAtivo["status_item"]) {
    setPedidos((current) =>
      current.map((pedido) =>
        pedido.id !== pedidoId
          ? pedido
          : {
              ...pedido,
              itens: pedido.itens.map((item) => (item.id === itemId ? { ...item, status_item: novoStatus } : item)),
            }
      )
    );
  }

  async function handleEntregarItem(pedido: PedidoAtivo, item: PedidoItemAtivo) {
    setUpdatingItemId(item.id);

    try {
      await updateItemStatus(item.id, "entregue");
      atualizarStatusItemLocal(pedido.id, item.id, "entregue");
      showToast(`${item.quantidade}x ${item.produto_nome} entregue à mesa ${pedido.numero_comanda}.`, "success");
    } catch (error) {
      showToast(getApiErrorMessage(error, "Não foi possível marcar o item como entregue."), "error");
    } finally {
      setUpdatingItemId(null);
    }
  }

  async function handleDesfazerEntrega(pedido: PedidoAtivo, item: PedidoItemAtivo) {
    setUpdatingItemId(item.id);

    try {
      await updateItemStatus(item.id, "pronto");
      atualizarStatusItemLocal(pedido.id, item.id, "pronto");
      showToast(`Entrega de ${item.produto_nome} desfeita.`, "success");
    } catch (error) {
      showToast(getApiErrorMessage(error, "Não foi possível desfazer a entrega do item."), "error");
    } finally {
      setUpdatingItemId(null);
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
      navigate("/garcom/mesas");
    } catch (error) {
      showToast(getApiErrorMessage(error, "Não foi possível cancelar a comanda."), "error");
      setIsCancelling(false);
      setIsConfirmCancelOpen(false);
    }
  }

  if (!id) {
    return <Navigate to="/garcom/mesas" replace />;
  }

  return (
    <div className="min-h-svh bg-slate-50 pb-28 dark:bg-slate-950">
      <div className="sticky top-0 z-20 border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => navigate("/garcom/mesas")}
            aria-label="Voltar ao salão"
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Comanda</p>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              {comanda ? `Mesa ${comanda.numero_comanda}` : "Carregando..."}
            </h1>
          </div>
          <button
            type="button"
            onClick={fetchDados}
            disabled={isLoading}
            aria-label="Atualizar cardápio"
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <RefreshCw className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>

        {comanda && (
          <>
            <div className="flex items-center gap-2 overflow-x-auto px-4 pb-3 [scrollbar-width:none]">
              {comanda.divisao_por_integrante.map((integrante) => (
                <span
                  key={integrante.integrante_id}
                  className="shrink-0 whitespace-nowrap rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  {integrante.nome}
                </span>
              ))}
              <button
                type="button"
                onClick={() => setIsAddIntegranteOpen(true)}
                className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border border-dashed border-orange-300 px-3 py-1.5 text-xs font-medium text-orange-600 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-950/40"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Adicionar
              </button>
            </div>

            <div className="flex gap-1 px-4 pb-3">
              <button
                type="button"
                onClick={() => setAbaAtiva("cardapio")}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                  abaAtiva === "cardapio"
                    ? "bg-orange-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                Cardápio
              </button>
              <button
                type="button"
                onClick={() => setAbaAtiva("pedidos")}
                className={`relative rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                  abaAtiva === "pedidos"
                    ? "bg-orange-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                Pedidos
                {totalProntosParaEntregar > 0 && (
                  <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1 text-xs font-bold text-white">
                    {totalProntosParaEntregar}
                  </span>
                )}
              </button>
            </div>

            {abaAtiva === "cardapio" && (
              <>
                <div className="px-4 pb-3">
                  <label htmlFor="busca-produto" className="sr-only">
                    Buscar produto pelo nome
                  </label>
                  <div className="relative">
                    <Search className="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-slate-400" />
                    <input
                      id="busca-produto"
                      type="search"
                      placeholder="Buscar produto pelo nome..."
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <div className="flex gap-2 overflow-x-auto px-4 pb-3 [scrollbar-width:none]">
                  <button
                    type="button"
                    onClick={() => setSelectedCategoriaId(null)}
                    className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      selectedCategoriaId === null
                        ? "bg-orange-600 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    }`}
                  >
                    Todos
                  </button>
                  {categorias.map((categoria) => (
                    <button
                      key={categoria.id}
                      type="button"
                      onClick={() => setSelectedCategoriaId(categoria.id)}
                      className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                        selectedCategoriaId === categoria.id
                          ? "bg-orange-600 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                      }`}
                    >
                      {categoria.nome}
                    </button>
                  ))}
                </div>
              </>
            )}

            {abaAtiva === "pedidos" && (
              <PedidosResumoBar
                contagens={contagensPorStatus}
                filtro={filtroStatusPedidos}
                onFiltroChange={setFiltroStatusPedidos}
              />
            )}
          </>
        )}
      </div>

      <main className="px-4 py-4">
        {isLoading && !comanda && (
          <div className="flex flex-col items-center gap-3 py-16 text-slate-400 dark:text-slate-500">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <p className="text-sm">Carregando comanda...</p>
          </div>
        )}

        {!isLoading && errorMessage && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950/30">
            <p className="text-sm text-red-700 dark:text-red-300">{errorMessage}</p>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => navigate("/garcom/mesas")}>
                Voltar ao salão
              </Button>
              <Button variant="danger" onClick={fetchDados}>
                Tentar novamente
              </Button>
            </div>
          </div>
        )}

        {!errorMessage && comanda && abaAtiva === "cardapio" && produtosFiltrados.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-16 text-center text-slate-400 dark:text-slate-500">
            <UtensilsCrossed className="h-10 w-10" />
            <p className="text-sm">Nenhum produto encontrado.</p>
          </div>
        )}

        {!errorMessage && abaAtiva === "cardapio" && produtosFiltrados.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {produtosFiltrados.map((produto) => (
              <ProdutoCard key={produto.id} produto={produto} onAdd={handleAddToCart} />
            ))}
          </div>
        )}

        {!errorMessage && comanda && abaAtiva === "pedidos" && pedidosOrdenados.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16 text-center text-slate-400 dark:text-slate-500">
            <ClipboardList className="h-10 w-10" />
            <p className="text-sm">Nenhum pedido enviado para esta mesa ainda.</p>
            {isComandaZerada && (
              <button
                type="button"
                onClick={() => setIsConfirmCancelOpen(true)}
                data-testid="botao-cancelar-comanda-zerada"
                className="mt-2 flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700"
              >
                <Ban className="h-4 w-4" />
                Cancelar / Fechar Comanda Zerada
              </button>
            )}
          </div>
        )}

        {!errorMessage && abaAtiva === "pedidos" && pedidosOrdenados.length > 0 && pedidosFiltrados.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-16 text-center text-slate-400 dark:text-slate-500">
            <ClipboardList className="h-10 w-10" />
            <p className="text-sm">Nenhum item encontrado para o filtro selecionado.</p>
          </div>
        )}

        {!errorMessage && abaAtiva === "pedidos" && pedidosFiltrados.length > 0 && (
          <div className="flex flex-col gap-3">
            {pedidosFiltrados.map((pedido) => (
              <PedidoEnviadoCard
                key={pedido.id}
                pedido={pedido}
                updatingItemId={updatingItemId}
                onEntregarItem={handleEntregarItem}
                onDesfazerEntrega={handleDesfazerEntrega}
              />
            ))}
          </div>
        )}
      </main>

      {cart.length > 0 && !isCartOpen && (
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="fixed inset-x-4 bottom-4 z-30 flex items-center justify-between gap-3 rounded-2xl bg-slate-900 px-5 py-4 text-white shadow-xl transition-transform active:scale-[0.98] sm:inset-x-auto sm:right-4 sm:w-96"
        >
          <span className="flex items-center gap-2 text-sm font-medium">
            <ShoppingCart className="h-5 w-5" />
            {cartCount} {cartCount === 1 ? "item" : "itens"}
          </span>
          <span className="font-semibold">{formatCurrency(cartTotal)}</span>
          <span className="text-sm font-semibold text-orange-400">Ver pedido</span>
        </button>
      )}

      {comanda && (
        <CartDrawer
          isOpen={isCartOpen}
          items={cart}
          integrantes={comanda.divisao_por_integrante}
          isSubmitting={isSubmittingPedido}
          onClose={() => setIsCartOpen(false)}
          onUpdateItem={handleUpdateCartItem}
          onRemoveItem={handleRemoveCartItem}
          onConfirm={handleConfirmarPedido}
        />
      )}

      <AddIntegranteModal
        isOpen={isAddIntegranteOpen}
        comandaId={id}
        onClose={() => setIsAddIntegranteOpen(false)}
        onAdded={handleIntegranteAdicionado}
      />

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
