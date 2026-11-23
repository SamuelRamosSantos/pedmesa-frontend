import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { NumeroDestaque } from "../components/ui/NumeroDestaque";
import { TituloPagina } from "../components/ui/TituloPagina";

export function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-slate-50 px-4 text-center dark:bg-slate-950">
      <NumeroDestaque className="text-slate-300 dark:text-slate-700">
        404
      </NumeroDestaque>
      <div>
        <TituloPagina>Página não encontrada</TituloPagina>
        <p className="mt-1 text-corpo text-slate-500 dark:text-slate-400">
          O endereço acessado não existe.
        </p>
      </div>
      <Link to="/login">
        <Button>Ir para o login</Button>
      </Link>
    </div>
  );
}
