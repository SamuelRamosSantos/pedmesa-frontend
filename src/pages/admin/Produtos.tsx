import {
  ChefHat,
  Menu,
  Package,
  PlusCircle,
  RefreshCw,
  Search,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppShell } from "../../components/layout/AppShell";
import { Button } from "../../components/ui/Button";
import { ItemEditavel } from "../../components/ui/ItemEditavel";
import { useTenant } from "../../contexts/TenantContext";
import { getApiErrorMessage } from "../../lib/api-error";
import { formatCurrency } from "../../lib/format";
import { listCategorias } from "../../services/categoria.service";
import { listProdutos } from "../../services/produto.service";
import type { Categoria } from "../../types/categoria";
import type { Produto } from "../../types/produto";
import { ProdutoModal } from "./components/ProdutoModal";

export function Produtos() {
  const { tenant } = useTenant();
  const usaModuloCozinha = tenant?.usa_modulo_cozinha ?? true;

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState<Produto | null>(null);

  const fetchDados = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [produtosData, categoriasData] = await Promise.all([
        listProdutos(),
        listCategorias(),
      ]);
      setProdutos(produtosData);
      setCategorias(
        [...categoriasData].sort((a, b) => a.ordem_exibicao - b.ordem_exibicao),
      );
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "Não foi possível carregar os produtos."),
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDados();
  }, [fetchDados]);

  const categoriasPorId = useMemo(
    () => new Map(categorias.map((categoria) => [categoria.id, categoria])),
    [categorias],
  );

  const produtosFiltrados = useMemo(() => {
    const termo = searchTerm.trim().toLowerCase();

    return produtos
      .filter(
        (produto) =>
          !categoriaFiltro || produto.categoria_id === categoriaFiltro,
      )
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

  function handleProdutoExcluido(produtoId: string) {
    setProdutos((current) => current.filter((item) => item.id !== produtoId));
    setIsModalOpen(false);
    setProdutoEditando(null);
  }

  return (
    <AppShell>
      {({ openSidebar }) => (
        <>
          <header className="sticky top-0 z-10 flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-6 sm:py-4 dark:border-slate-800 dark:bg-slate-900">
            <button
              type="button"
              onClick={openSidebar}
              aria-label="Abrir menu"
              className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <h1 className="text-lg font-bold text-slate-900 dark:text-white">
              Gestão de Produtos
            </h1>

            <div className="ml-auto flex items-center gap-3">
              <button
                type="button"
                onClick={fetchDados}
                disabled={isLoading}
                aria-label="Atualizar lista de produtos"
                className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                <RefreshCw
                  className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`}
                />
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
                <p className="text-sm text-red-700 dark:text-red-300">
                  {errorMessage}
                </p>
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
                  <p className="text-sm">
                    Nenhum produto encontrado para os filtros selecionados.
                  </p>
                )}
              </div>
            )}

            {!isLoading && !errorMessage && produtosFiltrados.length > 0 && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {produtosFiltrados.map((produto) => (
                  <ItemEditavel
                    key={produto.id}
                    variante="card"
                    inativo={!produto.disponivel}
                    data-testid={`produto-card-${produto.nome}`}
                    aria-label={`Editar produto ${produto.nome}`}
                    onClick={() => handleEditarProduto(produto)}
                  >
                    <div className="flex w-full items-start justify-between gap-2">
                      <div className="flex items-start gap-3">
                        {produto.imagem_url && (
                          <img
                            src={produto.imagem_url}
                            alt=""
                            className="h-12 w-12 shrink-0 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {produto.nome}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {categoriasPorId.get(produto.categoria_id)?.nome ??
                              "Sem categoria"}
                          </p>
                        </div>
                      </div>
                      {!produto.disponivel && (
                        <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-950/60 dark:text-red-300">
                          Esgotado
                        </span>
                      )}
                    </div>

                    {produto.descricao && (
                      <p className="line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                        {produto.descricao}
                      </p>
                    )}

                    <div className="mt-auto flex flex-wrap items-center gap-2">
                      <span className="text-lg font-bold text-slate-900 dark:text-white">
                        {formatCurrency(produto.preco)}
                      </span>

                      {usaModuloCozinha &&
                        (produto.precisa_preparo ? (
                          <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                            <ChefHat className="h-3 w-3" />
                            Requer preparo
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                            <Zap className="h-3 w-3" />
                            Auto-pronto
                          </span>
                        ))}
                    </div>
                  </ItemEditavel>
                ))}
              </div>
            )}
          </main>

          <ProdutoModal
            isOpen={isModalOpen}
            produtoEditando={produtoEditando}
            categorias={categorias}
            usaModuloCozinha={usaModuloCozinha}
            onClose={() => {
              setIsModalOpen(false);
              setProdutoEditando(null);
            }}
            onSaved={handleModalSaved}
            onDeleted={handleProdutoExcluido}
          />
        </>
      )}
    </AppShell>
  );
}
