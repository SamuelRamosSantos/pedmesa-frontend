import {
  ArrowLeft,
  ChefHat,
  Package,
  Pencil,
  PlusCircle,
  RefreshCw,
  Search,
  Trash2,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { ThemeToggle } from "../../components/ui/ThemeToggle";
import { useToast } from "../../contexts/ToastContext";
import { getApiErrorMessage } from "../../lib/api-error";
import { formatCurrency } from "../../lib/format";
import { listCategorias } from "../../services/categoria.service";
import { deleteProduto, listProdutos, updateProdutoDisponibilidade } from "../../services/produto.service";
import type { Categoria } from "../../types/categoria";
import type { Produto } from "../../types/produto";
import { ProdutoModal } from "./components/ProdutoModal";

export function Produtos() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState<Produto | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchDados = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [produtosData, categoriasData] = await Promise.all([listProdutos(), listCategorias()]);
      setProdutos(produtosData);
      setCategorias([...categoriasData].sort((a, b) => a.ordem_exibicao - b.ordem_exibicao));
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Não foi possível carregar os produtos."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDados();
  }, [fetchDados]);

  const categoriasPorId = useMemo(() => new Map(categorias.map((categoria) => [categoria.id, categoria])), [
    categorias,
  ]);

  const produtosFiltrados = useMemo(() => {
    const termo = searchTerm.trim().toLowerCase();

    return produtos
      .filter((produto) => !categoriaFiltro || produto.categoria_id === categoriaFiltro)
      .filter((produto) => !termo || produto.nome.toLowerCase().includes(termo))
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }, [produtos, searchTerm, categoriaFiltro]);

  function handleNovoProduto() {
    setProdutoEditando(null);
    setIsModalOpen(true);
  }

  function handleEditarProduto(produto: Produto) {
    setProdutoEditando(produto);
    setIsModalOpen(true);
  }

  function handleModalSaved() {
    setIsModalOpen(false);
    setProdutoEditando(null);
    fetchDados();
  }

  async function handleToggleEsgotado(produto: Produto) {
    setTogglingId(produto.id);

    try {
      const atualizado = await updateProdutoDisponibilidade(produto.id, !produto.disponivel);
      setProdutos((current) => current.map((item) => (item.id === produto.id ? atualizado : item)));
      showToast(
        atualizado.disponivel
          ? `"${produto.nome}" marcado como disponível.`
          : `"${produto.nome}" marcado como esgotado.`,
        "success"
      );
    } catch (error) {
      showToast(getApiErrorMessage(error, "Não foi possível atualizar a disponibilidade."), "error");
    } finally {
      setTogglingId(null);
    }
  }

  async function handleExcluir(produto: Produto) {
    if (!window.confirm(`Tem certeza que deseja excluir "${produto.nome}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    setDeletingId(produto.id);

    try {
      await deleteProduto(produto.id);
      setProdutos((current) => current.filter((item) => item.id !== produto.id));
      showToast(`Produto "${produto.nome}" excluído.`, "success");
    } catch (error) {
      showToast(getApiErrorMessage(error, "Não foi possível excluir o produto."), "error");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="min-h-svh bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-20 flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-6 sm:py-4 dark:border-slate-800 dark:bg-slate-900">
        <button
          type="button"
          onClick={() => navigate("/caixa/mapa-mesas")}
          aria-label="Voltar"
          className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-600 text-white">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">PedMesa · Administração</p>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">Gestão de Produtos</h1>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <ThemeToggle />
          <button
            type="button"
            onClick={fetchDados}
            disabled={isLoading}
            aria-label="Atualizar lista de produtos"
            className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <RefreshCw className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <Button onClick={handleNovoProduto}>
            <PlusCircle className="h-4 w-4" />
            Novo Produto
          </Button>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-slate-400" />
          <label htmlFor="busca-produto-admin" className="sr-only">
            Buscar produto pelo nome
          </label>
          <input
            id="busca-produto-admin"
            type="search"
            placeholder="Buscar produto pelo nome..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
          />
        </div>

        <label htmlFor="filtro-categoria-admin" className="sr-only">
          Filtrar por categoria
        </label>
        <select
          id="filtro-categoria-admin"
          value={categoriaFiltro}
          onChange={(event) => setCategoriaFiltro(event.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        >
          <option value="">Todas as categorias</option>
          {categorias.map((categoria) => (
            <option key={categoria.id} value={categoria.id}>
              {categoria.nome}
            </option>
          ))}
        </select>
      </div>

      <main className="px-4 py-4 sm:px-6">
        {isLoading && (
          <div className="flex flex-col items-center gap-3 py-16 text-slate-400 dark:text-slate-500">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <p className="text-sm">Carregando produtos...</p>
          </div>
        )}

        {!isLoading && errorMessage && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950/30">
            <p className="text-sm text-red-700 dark:text-red-300">{errorMessage}</p>
            <Button variant="danger" onClick={fetchDados}>
              Tentar novamente
            </Button>
          </div>
        )}

        {!isLoading && !errorMessage && produtosFiltrados.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-16 text-center text-slate-400 dark:text-slate-500">
            <Package className="h-10 w-10" />
            {produtos.length === 0 ? (
              <p className="text-sm">Nenhum produto cadastrado ainda.</p>
            ) : (
              <p className="text-sm">Nenhum produto encontrado para os filtros selecionados.</p>
            )}
          </div>
        )}

        {!isLoading && !errorMessage && produtosFiltrados.length > 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {produtosFiltrados.map((produto) => (
              <div
                key={produto.id}
                data-testid={`produto-card-${produto.nome}`}
                className={`flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 ${
                  produto.disponivel ? "" : "opacity-70"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{produto.nome}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {categoriasPorId.get(produto.categoria_id)?.nome ?? "Sem categoria"}
                    </p>
                  </div>
                  {!produto.disponivel && (
                    <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-950/60 dark:text-red-300">
                      Esgotado
                    </span>
                  )}
                </div>

                {produto.descricao && (
                  <p className="line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{produto.descricao}</p>
                )}

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-lg font-bold text-slate-900 dark:text-white">
                    {formatCurrency(produto.preco)}
                  </span>

                  {produto.precisa_preparo ? (
                    <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                      <ChefHat className="h-3 w-3" />
                      Requer preparo
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                      <Zap className="h-3 w-3" />
                      Auto-pronto
                    </span>
                  )}
                </div>

                <div className="mt-1 flex items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => handleEditarProduto(produto)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-slate-100 px-2 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Editar
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleEsgotado(produto)}
                    disabled={togglingId === produto.id}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-slate-100 px-2 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-200 disabled:opacity-50 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    {produto.disponivel ? "Marcar esgotado" : "Marcar disponível"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleExcluir(produto)}
                    disabled={deletingId === produto.id}
                    aria-label={`Excluir ${produto.nome}`}
                    className="flex shrink-0 items-center justify-center rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:text-slate-500 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <ProdutoModal
        isOpen={isModalOpen}
        produtoEditando={produtoEditando}
        categorias={categorias}
        onClose={() => {
          setIsModalOpen(false);
          setProdutoEditando(null);
        }}
        onSaved={handleModalSaved}
      />
    </div>
  );
}
