import { ArrowRight, LogOut, UtensilsCrossed } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { ThemeToggle } from "../components/ui/ThemeToggle";
import { useAuth } from "../contexts/AuthContext";
import { ROLE_VIEW_INFO } from "../lib/role-routes";

export function SelecionarVisao() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  const opcoes = (user?.roles ?? []).map((role) => ROLE_VIEW_INFO[role]);

  return (
    <div className="min-h-svh bg-slate-50 px-4 py-12 dark:bg-slate-950">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <div className="mx-auto flex w-full max-w-lg flex-col items-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-600 text-white">
          <UtensilsCrossed className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Qual painel você quer abrir?</h1>
        <p className="mt-1 text-center text-sm text-slate-500 dark:text-slate-400">
          Olá, {user?.nome}. Sua conta tem acesso a mais de uma visão.
        </p>

        <div className="mt-8 flex w-full flex-col gap-3">
          {opcoes.map((opcao) => (
            <button
              key={opcao.role}
              type="button"
              onClick={() => navigate(opcao.route)}
              data-testid={`opcao-visao-${opcao.role}`}
              className="text-left"
            >
              <Card className="flex items-center justify-between gap-3 transition-colors hover:border-orange-300 dark:hover:border-orange-500/50">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{opcao.label}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{opcao.description}</p>
                </div>
                <ArrowRight className="h-5 w-5 shrink-0 text-slate-400 dark:text-slate-500" />
              </Card>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-8 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </div>
  );
}
