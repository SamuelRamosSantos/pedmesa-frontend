import type { HTMLAttributes, ReactNode } from "react";
import { CLASSES_DO_TOM, type Tom } from "../../lib/tons";

interface SeloProps extends HTMLAttributes<HTMLSpanElement> {
  tom: Tom;
  children: ReactNode;
  // Ícone decorativo à esquerda (o texto do selo é quem informa).
  icone?: ReactNode;
  // Sólido, para ler de longe (KDS). O padrão é o suave.
  forte?: boolean;
  // Status encerrado com o item cancelado: texto riscado.
  riscado?: boolean;
}

// Selo de status do guia visual (PED-132). A cor vem do tom, nunca da tela.
export function Selo({
  tom,
  children,
  icone,
  forte = false,
  riscado = false,
  className = "",
  ...rest
}: SeloProps) {
  const classes = CLASSES_DO_TOM[tom];

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-legenda font-medium ${
        forte ? classes.seloForte : classes.selo
      } ${riscado ? "line-through" : ""} ${className}`}
      {...rest}
    >
      {icone && (
        <span aria-hidden="true" className="flex [&>svg]:h-3.5 [&>svg]:w-3.5">
          {icone}
        </span>
      )}
      {children}
    </span>
  );
}
