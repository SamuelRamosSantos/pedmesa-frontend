import type { HTMLAttributes, ReactNode } from "react";

interface NumeroDestaqueProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
}

// Número que se lê de relance (mesa, pedido, total), no token `text-destaque` do guia
// visual (PED-132). Algarismos de largura fixa: os números não "pulam" ao mudar.
export function NumeroDestaque({
  children,
  className = "",
  ...rest
}: NumeroDestaqueProps) {
  return (
    <span
      className={`text-destaque tabular-nums text-slate-900 dark:text-white ${className}`}
      {...rest}
    >
      {children}
    </span>
  );
}
