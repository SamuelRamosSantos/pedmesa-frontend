// Paleta semântica do guia visual (PED-132): uma cor por significado. Toda cor de status,
// selo ou aviso sai daqui, nunca de uma classe escolhida na tela. Regras de uso em
// docs/ARQUITETURA.md, seção "Guia visual".

export const TONS = [
  "marca",
  "aviso",
  "andamento",
  "sucesso",
  "perigo",
  "neutro",
] as const;

export type Tom = (typeof TONS)[number];

// O que cada tom quer dizer, para a página do guia e para quem escolhe o tom.
export const SIGNIFICADO_DO_TOM: Record<Tom, string> = {
  marca: "Ação principal, seleção, foco e item ativo",
  aviso:
    "Aguardando ou pede atenção: pendente, observação, começando a atrasar",
  andamento: "Em andamento: em preparo, em rota",
  sucesso: "Pronto, pago, conectado, salvo",
  perigo: "Erro, atrasado, cancelar e excluir",
  neutro: "Concluído, cancelado, inativo, tipo de atendimento e o resto",
};

export interface ClassesDoTom {
  // Selo suave: fundo claro e texto escuro do tom. O padrão para status.
  selo: string;
  // Selo sólido, para ler de longe (KDS). Texto com contraste AA em 12px.
  seloForte: string;
  // Área inteira no tom (aviso em bloco, cabeçalho de coluna): fundo, borda e texto.
  superficie: string;
  // Só o texto ou o ícone no tom.
  texto: string;
}

// Classes escritas por extenso: o Tailwind só gera o que encontra literal no código.
export const CLASSES_DO_TOM: Record<Tom, ClassesDoTom> = {
  marca: {
    selo: "bg-marca-100 text-marca-800 dark:bg-marca-500/15 dark:text-marca-300",
    seloForte: "bg-marca-700 text-white",
    superficie:
      "border-marca-200 bg-marca-50 text-marca-800 dark:border-marca-500/30 dark:bg-marca-950/30 dark:text-marca-200",
    texto: "text-marca-700 dark:text-marca-400",
  },
  aviso: {
    selo: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
    seloForte: "bg-amber-400 text-amber-950",
    superficie:
      "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-950/30 dark:text-amber-200",
    texto: "text-amber-700 dark:text-amber-400",
  },
  andamento: {
    selo: "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300",
    seloForte: "bg-sky-700 text-white",
    superficie:
      "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-500/30 dark:bg-sky-950/30 dark:text-sky-200",
    texto: "text-sky-700 dark:text-sky-400",
  },
  sucesso: {
    selo: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
    seloForte: "bg-emerald-700 text-white",
    superficie:
      "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-950/30 dark:text-emerald-200",
    texto: "text-emerald-700 dark:text-emerald-400",
  },
  perigo: {
    selo: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300",
    seloForte: "bg-red-600 text-white",
    superficie:
      "border-red-200 bg-red-50 text-red-800 dark:border-red-500/30 dark:bg-red-950/30 dark:text-red-200",
    texto: "text-red-700 dark:text-red-400",
  },
  neutro: {
    selo: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    seloForte: "bg-slate-600 text-white",
    superficie:
      "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300",
    texto: "text-slate-600 dark:text-slate-400",
  },
};
