import { LogOut, Pencil, PlusCircle, RefreshCw, Search, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import logoIcon from "../../assets/logo-icon.svg";
import { Button } from "../../components/ui/Button";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { ThemeToggle } from "../../components/ui/ThemeToggle";
import { useAuth } from "../../contexts/AuthContext";
import { useSuperAdminAuth } from "../../contexts/SuperAdminAuthContext";
import { useToast } from "../../contexts/ToastContext";
import { getApiErrorMessage } from "../../lib/api-error";
import { formatDataHora } from "../../lib/format";
import { getHomeRouteForRoles } from "../../lib/role-routes";
import { impersonarTenant, listTenants, updateTenantStatus } from "../../services/super-admin.service";
import type { TenantAdminItem, TenantStatus } from "../../types/super-admin";
import { EditarTenantModal } from "./components/EditarTenantModal";
import { NovoTenantModal } from "./components/NovoTenantModal";

type FiltroStatus = "todos" | TenantStatus;

const OPCOES_FILTRO: { value: FiltroStatus; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "ativo", label: "Ativos" },
  { value: "suspenso", label: "Suspensos" },
  { value: "cancelado", label: "Cancelados" },
];

const STATUS_BADGE: Record<TenantStatus, string> = {
  ativo: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
  suspenso: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
  cancelado: "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300",
};

const STATUS_LABEL: Record<TenantStatus, string> = {
  ativo: "Ativo",
  suspenso: "Suspenso",
  cancelado: "Cancelado",
};

interface AcaoStatusPendente {
  tenant: TenantAdminItem;
  novoStatus: TenantStatus;
  titulo: string;
  descricao: string;
}

export function PainelSuperAdmin() {
  const navigate = useNavigate();
  const { login: authenticateTenant } = useAuth();
  const { superAdmin, logout } = useSuperAdminAuth();
  const { showToast } = useToast();

  const [tenants, setTenants] = useState<TenantAdminItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [isNovoTenantModalOpen, setIsNovoTenantModalOpen] = useState(false);
  const [tenantEditando, setTenantEditando] = useState<TenantAdminItem | null>(null);
  const [acaoPendente, setAcaoPendente] = useState<AcaoStatusPendente | null>(null);
  const [isConfirmandoStatus, setIsConfirmandoStatus] = useState(false);
  const [acessandoComoId, setAcessandoComoId] = useState<string | null>(null);

  const fetchTenants = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await listTenants(filtroStatus === "todos" ? {} : { status: filtroStatus });
      setTenants(data);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Não foi possível carregar os estabelecimentos."));
    } finally {
      setIsLoading(false);
    }
  }, [filtroStatus]);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  const tenantsFiltrados = useMemo(() => {
    const termo = searchTerm.trim().toLowerCase();

    if (!termo) {
      return tenants;
    }

    return tenants.filter((tenant) => tenant.nome_fantasia.toLowerCase().includes(termo));
  }, [tenants, searchTerm]);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  function handleNovoTenantSaved() {
    setIsNovoTenantModalOpen(false);
    fetchTenants();
  }

  function handleTenantEditado(tenantAtualizado: TenantAdminItem) {
    setTenants((current) => current.map((item) => (item.id === tenantAtualizado.id ? tenantAtualizado : item)));
    setTenantEditando(null);
  }

  function solicitarSuspender(tenant: TenantAdminItem) {
    setAcaoPendente({
      tenant,
      novoStatus: "suspenso",
      titulo: "Suspender estabelecimento?",
      descricao: `Os usuários de "${tenant.nome_fantasia}" não vão mais conseguir entrar no sistema até que o estabelecimento seja reativado.`,
    });
  }

  function solicitarCancelar(tenant: TenantAdminItem) {
    setAcaoPendente({
      tenant,
      novoStatus: "cancelado",
      titulo: "Cancelar estabelecimento?",
      descricao: `"${tenant.nome_fantasia}" será marcado como cancelado e os usuários não vão mais conseguir entrar no sistema.`,
    });
  }

  function solicitarReativar(tenant: TenantAdminItem) {
    setAcaoPendente({
      tenant,
      novoStatus: "ativo",
      titulo: "Reativar estabelecimento?",
      descricao: `"${tenant.nome_fantasia}" volta a ficar acessível normalmente para os usuários.`,
    });
  }

  async function handleConfirmarAcaoStatus() {
    if (!acaoPendente) {
      return;
    }

    setIsConfirmandoStatus(true);

    try {
      const atualizado = await updateTenantStatus(acaoPendente.tenant.id, acaoPendente.novoStatus);
      setTenants((current) => current.map((item) => (item.id === atualizado.id ? atualizado : item)));
      showToast(`Estabelecimento "${atualizado.nome_fantasia}" agora está ${STATUS_LABEL[atualizado.status]}.`, "success");
      setAcaoPendente(null);
    } catch (error) {
      showToast(getApiErrorMessage(error, "Não foi possível atualizar o status do estabelecimento."), "error");
    } finally {
      setIsConfirmandoStatus(false);
    }
  }

  async function handleAcessarComo(tenant: TenantAdminItem) {
    setAcessandoComoId(tenant.id);

    try {
      const resultado = await impersonarTenant(tenant.id);
      authenticateTenant(resultado.token, resultado.usuario);
      navigate(getHomeRouteForRoles(resultado.usuario.roles));
    } catch (error) {
      showToast(getApiErrorMessage(error, "Não foi possível acessar como esse estabelecimento."), "error");
      setAcessandoComoId(null);
    }
  }

  return (
    <div className="min-h-svh bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <img src={logoIcon} alt="PedMesa" className="h-11 w-11 rounded-xl" />
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">PedMesa · Painel Super-Admin</p>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">Estabelecimentos</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-slate-500 dark:text-slate-400 sm:inline">{superAdmin?.nome}</span>
          <ThemeToggle />
          <button
            type="button"
            onClick={fetchTenants}
            disabled={isLoading}
            aria-label="Atualizar lista de estabelecimentos"
            className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <RefreshCw className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <Button variant="secondary" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex gap-1 rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
            {OPCOES_FILTRO.map((opcao) => (
              <button
                key={opcao.value}
                type="button"
                onClick={() => setFiltroStatus(opcao.value)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  filtroStatus === opcao.value
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
              <label htmlFor="busca-tenant" className="sr-only">
                Buscar estabelecimento pelo nome
              </label>
              <input
                id="busca-tenant"
                type="search"
                placeholder="Buscar pelo nome..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-56 rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
              />
            </div>

            <Button onClick={() => setIsNovoTenantModalOpen(true)}>
              <PlusCircle className="h-4 w-4" />
              Novo Estabelecimento
            </Button>
          </div>
        </div>

        <div className="mt-6">
          {isLoading && (
            <div className="flex flex-col items-center gap-3 py-16 text-slate-400 dark:text-slate-500">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <p className="text-sm">Carregando estabelecimentos...</p>
            </div>
          )}

          {!isLoading && errorMessage && (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950/30">
              <p className="text-sm text-red-700 dark:text-red-300">{errorMessage}</p>
              <Button variant="danger" onClick={fetchTenants}>
                Tentar novamente
              </Button>
            </div>
          )}

          {!isLoading && !errorMessage && tenantsFiltrados.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-16 text-center text-slate-400 dark:text-slate-500">
              <ShieldCheck className="h-10 w-10" />
              <p className="text-sm">Nenhum estabelecimento encontrado.</p>
            </div>
          )}

          {!isLoading && !errorMessage && tenantsFiltrados.length > 0 && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {tenantsFiltrados.map((tenant) => (
                <div
                  key={tenant.id}
                  data-testid={`tenant-card-${tenant.nome_fantasia}`}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{tenant.nome_fantasia}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{tenant.cnpj_cpf}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_BADGE[tenant.status]}`}
                    >
                      {STATUS_LABEL[tenant.status]}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Criado em {formatDataHora(tenant.criado_em)}
                  </p>

                  <div className="mt-1 flex flex-col gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleAcessarComo(tenant)}
                        isLoading={acessandoComoId === tenant.id}
                        className="flex-1"
                      >
                        Acessar como
                      </Button>
                      <button
                        type="button"
                        onClick={() => setTenantEditando(tenant)}
                        aria-label={`Editar ${tenant.nome_fantasia}`}
                        title="Editar dados do estabelecimento"
                        className="flex shrink-0 items-center justify-center rounded-lg bg-slate-100 p-2.5 text-slate-600 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex gap-2">
                      {tenant.status !== "ativo" && (
                        <button
                          type="button"
                          onClick={() => solicitarReativar(tenant)}
                          className="flex-1 rounded-lg bg-slate-100 px-2 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                          Reativar
                        </button>
                      )}
                      {tenant.status !== "suspenso" && tenant.status !== "cancelado" && (
                        <button
                          type="button"
                          onClick={() => solicitarSuspender(tenant)}
                          className="flex-1 rounded-lg bg-amber-50 px-2 py-1.5 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-100 dark:bg-amber-950/30 dark:text-amber-300 dark:hover:bg-amber-950/50"
                        >
                          Suspender
                        </button>
                      )}
                      {tenant.status !== "cancelado" && (
                        <button
                          type="button"
                          onClick={() => solicitarCancelar(tenant)}
                          className="flex-1 rounded-lg bg-red-50 px-2 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-950/50"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <NovoTenantModal
        isOpen={isNovoTenantModalOpen}
        onClose={() => setIsNovoTenantModalOpen(false)}
        onSaved={handleNovoTenantSaved}
      />

      <EditarTenantModal
        tenant={tenantEditando}
        onClose={() => setTenantEditando(null)}
        onSaved={handleTenantEditado}
      />

      <ConfirmDialog
        isOpen={acaoPendente !== null}
        title={acaoPendente?.titulo ?? ""}
        description={acaoPendente?.descricao ?? ""}
        confirmLabel="Confirmar"
        isConfirming={isConfirmandoStatus}
        onCancel={() => setAcaoPendente(null)}
        onConfirm={handleConfirmarAcaoStatus}
      />
    </div>
  );
}
