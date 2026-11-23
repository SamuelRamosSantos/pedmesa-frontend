import type { ReactNode } from "react";

interface TituloPaginaProps {
  children: ReactNode;
  // Linha de apoio abaixo do título (o que a tela faz, contagem...).
  apoio?: ReactNode;
  className?: string;
}

// Título de cada tela (guia visual, PED-132): um `h1` por página, sempre no mesmo token.
export function TituloPagina({
  children,
  apoio,
  className = "",
}: TituloPaginaProps) {
  return (
    <div className={`flex min-w-0 flex-col gap-1 ${className}`}>
      <h1 className="text-titulo-pagina text-slate-900 dark:text-white">
        {children}
      </h1>
      {apoio && (
        <p className="text-corpo text-slate-600 dark:text-slate-400">{apoio}</p>
      )}
    </div>
  );
}
