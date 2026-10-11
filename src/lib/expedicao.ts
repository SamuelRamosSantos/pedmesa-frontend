import type { EntregaEstado, EntregaPainel, StatusEntrega } from "../types/delivery";

// Painel Kanban de expedição (PED-110). As regras de transição espelham o backend
// (entrega-status-transition.ts), que continua sendo quem decide.

export type StatusColuna = Exclude<StatusEntrega, "cancelado">;

export interface ColunaExpedicao {
  status: StatusColuna;
  titulo: string;
  recolhivel: boolean;
}

export const COLUNAS_EXPEDICAO: readonly ColunaExpedicao[] = [
  { status: "em_producao", titulo: "Em produção", recolhivel: false },
  { status: "pronto_para_envio", titulo: "Pronto para envio", recolhivel: false },
  { status: "em_rota", titulo: "Em rota", recolhivel: false },
  { status: "entregue", titulo: "Entregues hoje", recolhivel: true },
];

export interface AcaoEntrega {
  label: string;
  para: StatusEntrega;
}

export const AVANCAR: Partial<Record<StatusEntrega, AcaoEntrega>> = {
  em_producao: { label: "Pronto para envio", para: "pronto_para_envio" },
  pronto_para_envio: { label: "Saiu para entrega", para: "em_rota" },
  em_rota: { label: "Entregue", para: "entregue" },
};

export const VOLTAR: Partial<Record<StatusEntrega, AcaoEntrega>> = {
  pronto_para_envio: { label: "Voltar para produção", para: "em_producao" },
  em_rota: { label: "Retornou sem entregar", para: "pronto_para_envio" },
};

// Em rota não cancela direto (ADR-001): primeiro registra o retorno, depois cancela.
export function podeCancelar(status: StatusEntrega): boolean {
  return status === "em_producao" || status === "pronto_para_envio";
}

export const MOTIVO_MINIMO_CARACTERES = 5;

export function exigeMotivo(atual: StatusEntrega, para: StatusEntrega): boolean {
  return para === "cancelado" || (atual === "em_rota" && para === "pronto_para_envio");
}

export function motivoValido(motivo: string): boolean {
  return motivo.trim().length >= MOTIVO_MINIMO_CARACTERES;
}

// Só fica pronta para envio quando a cozinha terminou tudo (o backend recusa antes disso).
export function aguardandoCozinha(entrega: Pick<EntregaPainel, "status_entrega" | "status_preparo">): boolean {
  return entrega.status_entrega === "em_producao" && entrega.status_preparo !== "pronto" && entrega.status_preparo !== "entregue";
}

export function agruparPorColuna(entregas: readonly EntregaPainel[]): Record<StatusColuna, EntregaPainel[]> {
  const colunas: Record<StatusColuna, EntregaPainel[]> = { em_producao: [], pronto_para_envio: [], em_rota: [], entregue: [] };

  for (const entrega of entregas) {
    if (entrega.status_entrega !== "cancelado") {
      colunas[entrega.status_entrega].push(entrega);
    }
  }

  const porCriacao = (a: EntregaPainel, b: EntregaPainel) => a.criado_em.localeCompare(b.criado_em);
  colunas.em_producao.sort(porCriacao);
  colunas.pronto_para_envio.sort(porCriacao);
  colunas.em_rota.sort(porCriacao);
  // Entregues: as mais recentes primeiro.
  colunas.entregue.sort((a, b) => porCriacao(b, a));

  return colunas;
}

export type TomDoTempo = "neutro" | "alerta" | "critico";

// Margem antes da previsão em que o card já pede atenção.
const ALERTA_ANTES_DA_PREVISAO_MS = 10 * 60_000;

// Neutro com folga; alerta ao chegar perto da previsão (10 min antes); crítico depois dela.
export function tomDoTempo(entrega: Pick<EntregaPainel, "status_entrega" | "previsao_entrega_em">, agora: Date): TomDoTempo {
  if (entrega.previsao_entrega_em === null || entrega.status_entrega === "entregue" || entrega.status_entrega === "cancelado") {
    return "neutro";
  }

  const faltaMs = new Date(entrega.previsao_entrega_em).getTime() - agora.getTime();

  if (faltaMs < 0) {
    return "critico";
  }

  return faltaMs <= ALERTA_ANTES_DA_PREVISAO_MS ? "alerta" : "neutro";
}

// "#0007": mesmo formato do cupom.
export function formatarNumeroEntrega(numero: number): string {
  return `#${String(numero).padStart(4, "0")}`;
}

function substituir(entregas: readonly EntregaPainel[], id: string, mudar: (entrega: EntregaPainel) => EntregaPainel): EntregaPainel[] {
  return entregas.map((entrega) => (entrega.id === id ? mudar(entrega) : entrega));
}

// Move o card na hora; o servidor confirma (aplicarEstado) ou o card volta (restaurarEntrega).
export function aplicarStatusOtimista(entregas: readonly EntregaPainel[], id: string, para: StatusEntrega): EntregaPainel[] {
  return substituir(entregas, id, (entrega) => ({ ...entrega, status_entrega: para }));
}

export function aplicarEstado(entregas: readonly EntregaPainel[], estado: EntregaEstado): EntregaPainel[] {
  const terminal = estado.status_entrega === "entregue" || estado.status_entrega === "cancelado";

  return substituir(entregas, estado.id, (entrega) => ({
    ...entrega,
    status_entrega: estado.status_entrega,
    versao: estado.versao,
    previsao_entrega_em: estado.previsao_entrega_em,
    atrasado: terminal ? false : entrega.atrasado,
  }));
}

export function restaurarEntrega(entregas: readonly EntregaPainel[], anterior: EntregaPainel): EntregaPainel[] {
  return substituir(entregas, anterior.id, () => anterior);
}

// Resposta do polling sem desfazer uma transição otimista ainda em andamento.
export function mesclarComPendentes(
  doServidor: readonly EntregaPainel[],
  locais: readonly EntregaPainel[],
  pendentes: ReadonlySet<string>
): EntregaPainel[] {
  const localPorId = new Map(locais.map((entrega) => [entrega.id, entrega]));

  return doServidor.map((entrega) => (pendentes.has(entrega.id) ? (localPorId.get(entrega.id) ?? entrega) : entrega));
}
