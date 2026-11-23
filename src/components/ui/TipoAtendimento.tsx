import { Truck, UtensilsCrossed } from "lucide-react";
import type { HTMLAttributes } from "react";

export type TipoDeAtendimento = "mesa" | "delivery";

interface TipoAtendimentoProps extends HTMLAttributes<HTMLSpanElement> {
  tipo: TipoDeAtendimento;
}

const ROTULO: Record<TipoDeAtendimento, string> = {
  mesa: "Mesa",
  delivery: "Delivery",
};

// Rótulo do tipo de atendimento (guia visual, PED-132): neutro, com ícone. Mesa e delivery
// se diferenciam pelo ícone e pelo texto, não por cor, porque o tipo não é um status.
export function TipoAtendimento({
  tipo,
  className = "",
  ...rest
}: TipoAtendimentoProps) {
  const Icone = tipo === "delivery" ? Truck : UtensilsCrossed;

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-legenda font-medium text-slate-600 dark:text-slate-300 ${className}`}
      {...rest}
    >
      <Icone aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
      {ROTULO[tipo]}
    </span>
  );
}
