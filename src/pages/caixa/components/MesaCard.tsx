import { Clock, Users } from "lucide-react";
import { NumeroDestaque } from "../../../components/ui/NumeroDestaque";
import { Selo } from "../../../components/ui/Selo";
import { TipoAtendimento } from "../../../components/ui/TipoAtendimento";
import { formatHora } from "../../../lib/format";
import { CLASSES_DO_TOM } from "../../../lib/tons";
import type { ComandaListItem } from "../../../types/comanda";

interface MesaCardProps {
  numero: number;
  comanda: ComandaListItem | null;
  onClick: (comanda: ComandaListItem) => void;
}

export function MesaCard({ numero, comanda, onClick }: MesaCardProps) {
  if (!comanda) {
    return (
      <div className="flex min-h-36 flex-col items-center justify-center gap-1.5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center dark:border-slate-800 dark:bg-slate-900/60">
        <TipoAtendimento tipo="mesa" />
        <NumeroDestaque className="text-slate-300 dark:text-slate-700">
          {numero}
        </NumeroDestaque>
        <Selo tom="neutro">Livre</Selo>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onClick(comanda)}
      className={`flex min-h-36 flex-col items-center justify-center gap-1.5 rounded-2xl border p-4 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 ${CLASSES_DO_TOM.sucesso.superficie}`}
    >
      <TipoAtendimento tipo="mesa" />
      <NumeroDestaque>{numero}</NumeroDestaque>
      <Selo tom="sucesso" forte>
        Ocupada
      </Selo>

      <div className="mt-1 flex items-center justify-center gap-2 text-legenda font-medium tabular-nums text-slate-600 dark:text-slate-300">
        <span className="inline-flex items-center gap-1">
          <Users aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
          {comanda.total_integrantes}
        </span>
        <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">
          ·
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
          {formatHora(comanda.aberta_em)}
        </span>
      </div>
    </button>
  );
}
