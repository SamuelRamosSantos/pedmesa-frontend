import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";

export function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-slate-50 px-4 text-center dark:bg-slate-950">
      <p className="text-5xl font-bold text-slate-300 dark:text-slate-700">404</p>
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Página não encontrada</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">O endereço acessado não existe.</p>
      </div>
      <Link to="/login">
        <Button>Ir para o login</Button>
      </Link>
    </div>
  );
}
