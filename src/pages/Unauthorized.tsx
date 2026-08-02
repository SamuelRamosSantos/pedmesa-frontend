import { ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { useAuth } from "../contexts/AuthContext";
import { getHomeRouteForRole } from "../lib/role-routes";

export function Unauthorized() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleGoHome() {
    if (user) {
      navigate(getHomeRouteForRole(user.role), { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  }

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-slate-50 px-4 text-center dark:bg-slate-950">
      <ShieldAlert className="h-12 w-12 text-orange-500" />
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Acesso não autorizado</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Sua conta não tem permissão para acessar esta página.
        </p>
      </div>
      <div className="flex gap-3">
        <Button variant="secondary" onClick={handleLogout}>
          Sair
        </Button>
        <Button onClick={handleGoHome}>Voltar ao início</Button>
      </div>
    </div>
  );
}
