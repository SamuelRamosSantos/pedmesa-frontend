export function formatHora(isoDate: string): string {
  return new Date(isoDate).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export function formatData(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function formatDataHora(isoDate: string): string {
  return `${formatData(isoDate)} ${formatHora(isoDate)}`;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export function formatTempoDecorrido(isoDate: string): string {
  const minutos = Math.max(0, Math.floor((Date.now() - new Date(isoDate).getTime()) / 60000));

  if (minutos < 1) {
    return "agora mesmo";
  }

  if (minutos < 60) {
    return `há ${minutos} min`;
  }

  const horas = Math.floor(minutos / 60);
  const minutosRestantes = minutos % 60;

  return minutosRestantes === 0 ? `há ${horas}h` : `há ${horas}h${minutosRestantes}min`;
}
