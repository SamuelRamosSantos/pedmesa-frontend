import { Clock, Users } from "lucide-react";
import { NumeroDestaque } from "../../../components/ui/NumeroDestaque";
import { Selo } from "../../../components/ui/Selo";
import { TipoAtendimento } from "../../../components/ui/TipoAtendimento";
import { formatHora } from "../../../lib/format";
import type { ComandaListItem } from "../../../types/comanda";

interface ComandaCardProps {
  comanda: ComandaListItem;
  onClick: () => void;
}

export function ComandaCard({ comanda, onClick }: ComandaCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex items-center justify-between gap-2">
        <TipoAtendimento tipo="mesa" />
        <Selo tom="sucesso">Aberta</Selo>
      </div>

      <NumeroDestaque>{comanda.numero_comanda}</NumeroDestaque>

      <div className="flex items-center justify-between text-corpo text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          {comanda.total_integrantes}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          {formatHora(comanda.aberta_em)}
        </span>
      </div>
    </button>
  );
}
