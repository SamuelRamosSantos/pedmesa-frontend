import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";

type VarianteItemEditavel = "card" | "linha";

interface ItemEditavelProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  variante?: VarianteItemEditavel;
  inativo?: boolean;
  children: ReactNode;
  ref?: Ref<HTMLButtonElement>;
}

const CLASSES_VARIANTE: Record<VarianteItemEditavel, string> = {
  card: "flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgb(0_0_0_/0.06)] hover:border-slate-300 hover:bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none dark:hover:border-slate-700 dark:hover:bg-slate-800/60",
  linha:
    "flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600 dark:hover:bg-slate-800/60",
};

// Item de cadastro clicável (PED-135): substitui o botão "Editar" ou o lápis na lista.
// Como é um <button> nativo, recebe foco pelo Tab, mostra o contorno da marca e abre com
// Enter ou Espaço.
export function ItemEditavel({
  variante = "card",
  inativo = false,
  className = "",
  children,
  ref,
  ...rest
}: ItemEditavelProps) {
  return (
    <button
      ref={ref}
      type="button"
      className={`flex w-full cursor-pointer text-left text-corpo transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 disabled:cursor-not-allowed disabled:opacity-50 ${CLASSES_VARIANTE[variante]} ${inativo ? "opacity-70" : ""} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
