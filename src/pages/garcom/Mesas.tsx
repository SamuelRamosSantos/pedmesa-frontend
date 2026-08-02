import { LogOut, Plus, RefreshCw, Search, UtensilsCrossed } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../contexts/AuthContext";
import { getApiErrorMessage } from "../../lib/api-error";
import { listComandas } from "../../services/comanda.service";
import type { ComandaListItem } from "../../types/comanda";
import { ComandaCard } from "./components/ComandaCard";
import { NovaComandaModal } from "./components/NovaComandaModal";

export function Mesas() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [comandas, setComandas] = useState<ComandaListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchComandas = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await listComandas();
      setComandas(data);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Não foi possível carregar as mesas do salão."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComandas();
  }, [fetchComandas]);

  const comandasFiltradas = useMemo(() => {
    const termo = searchTerm.trim();

    if (!termo) {
      return comandas;
    }

    return comandas.filter((comanda) => String(comanda.numero_comanda).includes(termo));
  }, [comandas, searchTerm]);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  function handleComandaCriada() {
    setIsModalOpen(false);
    fetchComandas();
  }

  return (
    <div className="min-h-svh bg-slate-50 pb-24">
      <header className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-3">
        <div>
          <p className="text-xs text-slate-500">PedMesa</p>
          <h1 className="text-lg font-semibold text-slate-900">Salão</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchComandas}
            disabled={isLoading}
            aria-label="Atualizar lista de mesas"
            className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-50"
          >
            <RefreshCw className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-slate-900">{user?.nome}</p>
            <p className="text-xs uppercase tracking-wide text-slate-500">{user?.role}</p>
          </div>
          <Button variant="secondary" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </div>
      </header>

      <div className="border-b border-slate-200 bg-white px-4 py-3">
        <label htmlFor="busca-mesa" className="sr-only">
          Buscar mesa pelo número
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-slate-400" />
          <input
            id="busca-mesa"
            type="search"
            inputMode="numeric"
            placeholder="Buscar mesa pelo número..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
          />
        </div>
      </div>

      <main className="px-4 py-4">
        {isLoading && comandas.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16 text-slate-400">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <p className="text-sm">Carregando mesas...</p>
          </div>
        )}

        {!isLoading && errorMessage && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-sm text-red-700">{errorMessage}</p>
            <Button variant="danger" onClick={fetchComandas}>
              Tentar novamente
            </Button>
          </div>
        )}

        {!errorMessage && !isLoading && comandasFiltradas.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-16 text-center text-slate-400">
            <UtensilsCrossed className="h-10 w-10" />
            {comandas.length === 0 ? (
              <p className="text-sm">Nenhuma mesa aberta no momento.</p>
            ) : (
              <p className="text-sm">Nenhuma mesa encontrada para "{searchTerm}".</p>
            )}
          </div>
        )}

        {!errorMessage && comandasFiltradas.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {comandasFiltradas.map((comanda) => (
              <ComandaCard
                key={comanda.id}
                comanda={comanda}
                onClick={() => navigate(`/garcom/comanda/${comanda.id}`)}
              />
            ))}
          </div>
        )}
      </main>

      {!isModalOpen && (
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-6 right-6 z-30 flex items-center gap-2 rounded-full bg-orange-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-600/30 transition-transform hover:scale-105 hover:bg-orange-700 active:scale-95"
        >
          <Plus className="h-5 w-5" />
          Abrir Comanda
        </button>
      )}

      <NovaComandaModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onCreated={handleComandaCriada} />
    </div>
  );
}
