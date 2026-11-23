import { Check } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

interface OpcaoSelecionavelProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  selecionada: boolean;
  children: ReactNode;
}

// Cartão clicável para escolher uma opção entre várias (endereço de entrega...), no lugar
// de um radio visível. O ✓ ocupa espaço mesmo oculto: selecionar não desloca o texto.
export function OpcaoSelecionavel({
  selecionada,
  children,
  className = "",
  ...rest
}: OpcaoSelecionavelProps) {
  return (
    <button
      type="button"
      aria-pressed={selecionada}
      className={`flex w-full items-center gap-3 rounded-lg border px-3.5 py-2.5 text-left text-corpo transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 ${
        selecionada
          ? "border-marca-500 bg-marca-50 dark:border-marca-500/70 dark:bg-marca-950/20"
          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:border-slate-600 dark:hover:bg-slate-800/60"
      } ${className}`}
      {...rest}
    >
      <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1">
        {children}
      </span>
      <Check
        aria-hidden="true"
        className={`h-4 w-4 shrink-0 text-marca-600 dark:text-marca-400 ${selecionada ? "" : "invisible"}`}
      />
    </button>
  );
}
