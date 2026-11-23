import {
  Menu,
  PlusCircle,
  RefreshCw,
  ShieldCheck,
  Users as UsersIcon,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { AppShell } from "../../components/layout/AppShell";
import { Button } from "../../components/ui/Button";
import { ItemEditavel } from "../../components/ui/ItemEditavel";
import { Selo } from "../../components/ui/Selo";
import { TituloPagina } from "../../components/ui/TituloPagina";
import { useAuth } from "../../contexts/AuthContext";
import { useTenant } from "../../contexts/TenantContext";
import { getApiErrorMessage } from "../../lib/api-error";
import { ROLE_LABEL } from "../../lib/role-labels";
import { CLASSES_DO_TOM } from "../../lib/tons";
import { listUsuarios } from "../../services/usuario.service";
import type { Usuario } from "../../types/usuario";
import { UsuarioModal } from "./components/UsuarioModal";

export function Usuarios() {
  const { user: usuarioLogado } = useAuth();
  const { tenant } = useTenant();
  const usaModuloCozinha = tenant?.usa_modulo_cozinha ?? true;

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);

  const fetchUsuarios = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await listUsuarios();
      setUsuarios(data);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "Não foi possível carregar os usuários."),
      );
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

            <TituloPagina>Gestão de Usuários</TituloPagina>

            <div className="ml-auto flex items-center gap-3">
              <button
                type="button"
                onClick={fetchUsuarios}
                disabled={isLoading}
                aria-label="Atualizar lista de usuários"
                className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                <RefreshCw
                  className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`}
                />
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
                <p className="text-corpo">Carregando usuários...</p>
              </div>
            )}

            {!isLoading && errorMessage && (
              <div
                className={`flex flex-col items-center gap-3 rounded-2xl border p-6 text-center ${CLASSES_DO_TOM.perigo.superficie}`}
              >
                <p className={`text-corpo ${CLASSES_DO_TOM.perigo.texto}`}>
                  {errorMessage}
                </p>
                <Button variant="danger" onClick={fetchUsuarios}>
                  Tentar novamente
                </Button>
              </div>
            )}

            {!isLoading && !errorMessage && usuarios.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-16 text-center text-slate-400 dark:text-slate-500">
                <UsersIcon className="h-10 w-10" />
                <p className="text-corpo">Nenhum usuário cadastrado ainda.</p>
              </div>
            )}

            {!isLoading && !errorMessage && usuarios.length > 0 && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {usuarios.map((usuario) => {
                  const isSelf = usuario.id === usuarioLogado?.id;

                  return (
                    <ItemEditavel
                      key={usuario.id}
                      variante="card"
                      inativo={!usuario.ativo}
                      data-testid={`usuario-card-${usuario.nome}`}
                      aria-label={`Editar usuário ${usuario.nome}`}
                      onClick={() => handleEditarUsuario(usuario)}
                    >
                      <div className="flex w-full items-start justify-between gap-2">
                        <div className="flex items-start gap-3">
                          {usuario.foto_url ? (
                            <img
                              src={usuario.foto_url}
                              alt=""
                              className="h-10 w-10 shrink-0 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-corpo font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                              {usuario.nome.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="text-corpo font-semibold text-slate-900 dark:text-white">
                              {usuario.nome}
                              {isSelf && (
                                <span className="ml-1.5 text-legenda font-normal text-slate-400">
                                  (você)
                                </span>
                              )}
                            </p>
                            <p className="text-legenda text-slate-500 dark:text-slate-400">
                              {usuario.email}
                            </p>
                          </div>
                        </div>
                        {!usuario.ativo && (
                          <Selo tom="perigo" className="shrink-0">
                            Inativo
                          </Selo>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        {usuario.roles.map((role) => (
                          <Selo
                            key={role}
                            tom={role === "admin" ? "marca" : "neutro"}
                            icone={
                              role === "admin" ? <ShieldCheck /> : undefined
                            }
                          >
                            {ROLE_LABEL[role]}
                          </Selo>
                        ))}
                      </div>

                      {usuario.pode_excluir_item_fechamento && (
                        <p className="text-legenda text-slate-500 dark:text-slate-400">
                          Pode excluir item no fechamento
                        </p>
                      )}
                    </ItemEditavel>
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
        </>
      )}
    </AppShell>
  );
}
