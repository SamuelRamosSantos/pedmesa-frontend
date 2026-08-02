import { Clock, Receipt, Users } from "lucide-react";
import { formatHora } from "../../../lib/format";
import type { ComandaListItem } from "../../../types/comanda";

interface MesaCardProps {
  numero: number;
  comanda: ComandaListItem | null;
  onClick: (comanda: ComandaListItem) => void;
}

export function MesaCard({ numero, comanda, onClick }: MesaCardProps) {
  if (!comanda) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Mesa</span>
        <p className="text-2xl font-bold text-slate-300">{numero}</p>
        <span className="text-xs font-medium text-slate-400">Livre</span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onClick(comanda)}
      className="flex flex-col gap-2 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-emerald-700/70">Mesa</span>
        <span className="inline-flex items-center rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-semibold text-white">
          Ocupada
        </span>
      </div>

      <p className="text-3xl font-bold text-slate-900">{numero}</p>

      <div className="flex items-center justify-between text-sm text-slate-600">
        <span className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          {comanda.total_integrantes}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          {formatHora(comanda.aberta_em)}
        </span>
      </div>

      <div className="mt-1 flex items-center justify-center gap-1.5 rounded-lg bg-white px-2 py-2 text-xs font-semibold text-orange-700 shadow-sm">
        <Receipt className="h-3.5 w-3.5" />
        Ver Extrato / Fechar Conta
      </div>
    </button>
  );
}
