import { Clock, Users } from "lucide-react";
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
      className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:shadow-sm"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Mesa</span>
        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
          Aberta
        </span>
      </div>

      <p className="text-4xl font-bold text-slate-900">{comanda.numero_comanda}</p>

      <div className="flex items-center justify-between text-sm text-slate-500">
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
