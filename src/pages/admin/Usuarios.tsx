import {
  ArrowLeft,
  KeyRound,
  LayoutGrid,
  Pencil,
  PlusCircle,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Undo2,
  Users as UsersIcon,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logoIcon from "../../assets/logo-icon.svg";
import { Button } from "../../components/ui/Button";
import { ThemeToggle } from "../../components/ui/ThemeToggle";
import { useAuth } from "../../contexts/AuthContext";
import { useTenant } from "../../contexts/TenantContext";
import { useToast } from "../../contexts/ToastContext";
import { getApiErrorMessage } from "../../lib/api-error";
import { listUsuarios, updateUsuarioAtivo } from "../../services/usuario.service";
import type { UserRole } from "../../types/auth";
import type { Usuario } from "../../types/usuario";
import { AlterarSenhaModal } from "./components/AlterarSenhaModal";
import { UsuarioModal } from "./components/UsuarioModal";

const ROLE_LABEL: Record<UserRole, string> = {
  admin: "Admin",
  garcom: "Garçom",
  cozinha: "Cozinha",
  caixa: "Caixa",
};

export function Usuarios() {
  const navigate = useNavigate();
  const { user: usuarioLogado } = useAuth();
  const { tenant } = useTenant();
  const { showToast } = useToast();
  const usaModuloCozinha = tenant?.usa_modulo_cozinha ?? true;

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);
  const [usuarioAlterandoSenha, setUsuarioAlterandoSenha] = useState<Usuario | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchUsuarios = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await listUsuarios();
      setUsuarios(data);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Não foi possível carregar os usuários."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  function handleNovoUsuario() {
    setUsuarioEditando(null);
    setIsModalOpen(true);
  }

  function handleEditarUsuario(usuario: Usuario) {
    setUsuarioEditando(usuario);
    setIsModalOpen(true);
  }

  function handleModalSaved() {
    setIsModalOpen(false);
    setUsuarioEditando(null);
    fetchUsuarios();
  }

  function handleSenhaSaved() {
    setUsuarioAlterandoSenha(null);
  }

  async function handleToggleAtivo(usuario: Usuario) {
    setTogglingId(usuario.id);

    try {
      const atualizado = await updateUsuarioAtivo(usuario.id, !usuario.ativo);
      setUsuarios((current) => current.map((item) => (item.id === usuario.id ? atualizado : item)));
      showToast(
        atualizado.ativo ? `"${usuario.nome}" reativado.` : `"${usuario.nome}" desativado.`,
        "success"
      );
    } catch (error) {
      showToast(getApiErrorMessage(error, "Não foi possível atualizar o status do usuário."), "error");
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div className="min-h-svh bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-20 flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-6 sm:py-4 dark:border-slate-800 dark:bg-slate-900">
        <button
          type="button"
          onClick={() => navigate("/admin/dashboard")}
          aria-label="Voltar"
          className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <img src={logoIcon} alt="PedMesa" className="h-11 w-11 rounded-xl" />
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">PedMesa · Administração</p>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">Gestão de Usuários</h1>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-3">
          {usuarioLogado && usuarioLogado.roles.length > 1 && (
            <Button variant="secondary" onClick={() => navigate("/selecionar-visao")}>
              <LayoutGrid className="h-4 w-4" />
              Trocar Visão
            </Button>
          )}
          <ThemeToggle />
          <button
            type="button"
            onClick={fetchUsuarios}
            disabled={isLoading}
            aria-label="Atualizar lista de usuários"
            className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <RefreshCw className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <Button onClick={handleNovoUsuario}>
            <PlusCircle className="h-4 w-4" />
            Novo Usuário
          </Button>
        </div>
      </header>

      <main className="px-4 py-4 sm:px-6">
        {isLoading && (
          <div className="flex flex-col items-center gap-3 py-16 text-slate-400 dark:text-slate-500">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <p className="text-sm">Carregando usuários...</p>
          </div>
        )}

        {!isLoading && errorMessage && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950/30">
            <p className="text-sm text-red-700 dark:text-red-300">{errorMessage}</p>
            <Button variant="danger" onClick={fetchUsuarios}>
              Tentar novamente
            </Button>
          </div>
        )}

        {!isLoading && !errorMessage && usuarios.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-16 text-center text-slate-400 dark:text-slate-500">
            <UsersIcon className="h-10 w-10" />
            <p className="text-sm">Nenhum usuário cadastrado ainda.</p>
          </div>
        )}

        {!isLoading && !errorMessage && usuarios.length > 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {usuarios.map((usuario) => {
              const isSelf = usuario.id === usuarioLogado?.id;

              return (
                <div
                  key={usuario.id}
                  data-testid={`usuario-card-${usuario.nome}`}
                  className={`flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 ${
                    usuario.ativo ? "" : "opacity-70"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {usuario.nome}
                        {isSelf && <span className="ml-1.5 text-xs font-normal text-slate-400">(você)</span>}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{usuario.email}</p>
                    </div>
                    {!usuario.ativo && (
                      <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-950/60 dark:text-red-300">
                        Inativo
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {usuario.roles.map((role) => (
                      <span
                        key={role}
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                          role === "admin"
                            ? "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        {role === "admin" && <ShieldCheck className="h-3 w-3" />}
                        {ROLE_LABEL[role]}
                      </span>
                    ))}
                  </div>

                  {usuario.pode_excluir_item_fechamento && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Pode excluir item no fechamento
                    </p>
                  )}

                  <div className="mt-1 flex items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => handleEditarUsuario(usuario)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-slate-100 px-2 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Editar
                    </button>

                    <button
                      type="button"
                      onClick={() => setUsuarioAlterandoSenha(usuario)}
                      aria-label={`Alterar senha de ${usuario.nome}`}
                      title="Alterar senha"
                      className="flex shrink-0 items-center justify-center rounded-lg bg-slate-100 p-2 text-slate-600 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      <KeyRound className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleAtivo(usuario)}
                      disabled={togglingId === usuario.id || isSelf}
                      title={isSelf ? "Você não pode desativar sua própria conta." : undefined}
                      aria-label={usuario.ativo ? `Desativar ${usuario.nome}` : `Reativar ${usuario.nome}`}
                      className="flex shrink-0 items-center justify-center rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-400 dark:text-slate-500 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                    >
                      {usuario.ativo ? <Trash2 className="h-4 w-4" /> : <Undo2 className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <UsuarioModal
        isOpen={isModalOpen}
        usuarioEditando={usuarioEditando}
        usaModuloCozinha={usaModuloCozinha}
        onClose={() => {
          setIsModalOpen(false);
          setUsuarioEditando(null);
        }}
        onSaved={handleModalSaved}
      />

      <AlterarSenhaModal
        isOpen={usuarioAlterandoSenha !== null}
        usuario={usuarioAlterandoSenha}
        onClose={() => setUsuarioAlterandoSenha(null)}
        onSaved={handleSenhaSaved}
      />
    </div>
  );
}
