import type {
  EntregaEstado,
  EntregaPainel,
  StatusEntrega,
} from "../types/delivery";

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
  {
    status: "pronto_para_envio",
    titulo: "Pronto para envio",
    recolhivel: false,
  },
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
  // Entregue por engano (PED-127): reabre a comanda; o backend só aceita no mesmo dia.
  entregue: { label: "Desfazer entrega", para: "em_rota" },
};

// Em rota não cancela direto (ADR-001): primeiro registra o retorno, depois cancela.
export function podeCancelar(status: StatusEntrega): boolean {
  return status === "em_producao" || status === "pronto_para_envio";
}

export const MOTIVO_MINIMO_CARACTERES = 5;

export function exigeMotivo(
  atual: StatusEntrega,
  para: StatusEntrega,
): boolean {
  return (
    para === "cancelado" ||
    (atual === "em_rota" && para === "pronto_para_envio") ||
    (atual === "entregue" && para === "em_rota")
  );
}

export interface TextosDoMotivo {
  titulo: string;
  descricao: string;
  rotuloConfirmar: string;
  perigo: boolean;
}

// Textos do modal de motivo para cada transição que exige justificativa.
export function textosDoMotivo(
  atual: StatusEntrega,
  para: StatusEntrega,
  numeroEntrega: number,
): TextosDoMotivo {
  const numero = formatarNumeroEntrega(numeroEntrega);

  if (para === "cancelado") {
    return {
      titulo: `Cancelar entrega ${numero}`,
      descricao:
        "Os itens serão cancelados e a comanda fechada sem cobrança. Informe o motivo.",
      rotuloConfirmar: "Cancelar entrega",
      perigo: true,
    };
  }

  if (atual === "entregue") {
    return {
      titulo: `Desfazer entrega ${numero}`,
      descricao:
        'A entrega volta para "Em rota", a comanda é reaberta e o pagamento registrado na entrega é removido. Informe por que está desfazendo.',
      rotuloConfirmar: "Desfazer entrega",
      perigo: true,
    };
  }

  return {
    titulo: `Registrar retorno da entrega ${numero}`,
    descricao:
      'A entrega volta para "Pronto para envio". Informe por que não foi entregue.',
    rotuloConfirmar: "Registrar retorno",
    perigo: false,
  };
}

export function motivoValido(motivo: string): boolean {
  return motivo.trim().length >= MOTIVO_MINIMO_CARACTERES;
}

export const ROTULO_STATUS_ENTREGA: Record<StatusEntrega, string> = {
  em_producao: "Em produção",
  pronto_para_envio: "Pronto para envio",
  em_rota: "Em rota",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

// Produtos no card (PED-130): os primeiros e quantos ficaram de fora.
export const MAX_ITENS_NO_CARD = 4;

export function resumoDosItens<T>(
  itens: readonly T[],
  maximo = MAX_ITENS_NO_CARD,
): { visiveis: T[]; restantes: number } {
  // Mostrar "+1 item" ocuparia a mesma linha que o próprio item: mostra todos.
  if (itens.length <= maximo + 1) {
    return { visiveis: [...itens], restantes: 0 };
  }

  return {
    visiveis: itens.slice(0, maximo),
    restantes: itens.length - maximo,
  };
}

// Selo da cozinha no card (PED-129): o status do KDS enquanto a entrega está em produção,
// ou o aviso de que ela não passa pela cozinha (só itens sem preparo), para ninguém
// procurá-la no KDS. null nas outras situações.
export function seloDaCozinha(
  entrega: Pick<
    EntregaPainel,
    "status_entrega" | "status_preparo" | "passa_pela_cozinha"
  >,
  rotuloDoStatus: (status: EntregaPainel["status_preparo"]) => string,
): string | null {
  const antesDeSair =
    entrega.status_entrega === "em_producao" ||
    entrega.status_entrega === "pronto_para_envio";

  if (!entrega.passa_pela_cozinha) {
    return antesDeSair ? "Sem itens para a cozinha" : null;
  }

  return entrega.status_entrega === "em_producao"
    ? `Cozinha: ${rotuloDoStatus(entrega.status_preparo)}`
    : null;
}

// Só fica pronta para envio quando a cozinha terminou tudo (o backend recusa antes disso).
export function aguardandoCozinha(
  entrega: Pick<EntregaPainel, "status_entrega" | "status_preparo">,
): boolean {
  return (
    entrega.status_entrega === "em_producao" &&
    entrega.status_preparo !== "pronto" &&
    entrega.status_preparo !== "entregue"
  );
}

export function agruparPorColuna(
  entregas: readonly EntregaPainel[],
): Record<StatusColuna, EntregaPainel[]> {
  const colunas: Record<StatusColuna, EntregaPainel[]> = {
    em_producao: [],
    pronto_para_envio: [],
    em_rota: [],
    entregue: [],
  };

  for (const entrega of entregas) {
    if (entrega.status_entrega !== "cancelado") {
      colunas[entrega.status_entrega].push(entrega);
    }
  }

  const porCriacao = (a: EntregaPainel, b: EntregaPainel) =>
    a.criado_em.localeCompare(b.criado_em);
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
export function tomDoTempo(
  entrega: Pick<EntregaPainel, "status_entrega" | "previsao_entrega_em">,
  agora: Date,
): TomDoTempo {
  if (
    entrega.previsao_entrega_em === null ||
    entrega.status_entrega === "entregue" ||
    entrega.status_entrega === "cancelado"
  ) {
    return "neutro";
  }

  const faltaMs =
    new Date(entrega.previsao_entrega_em).getTime() - agora.getTime();

  if (faltaMs < 0) {
    return "critico";
  }

  return faltaMs <= ALERTA_ANTES_DA_PREVISAO_MS ? "alerta" : "neutro";
}

// "#0007": mesmo formato do cupom.
export function formatarNumeroEntrega(numero: number): string {
  return `#${String(numero).padStart(4, "0")}`;
}

function substituir(
  entregas: readonly EntregaPainel[],
  id: string,
  mudar: (entrega: EntregaPainel) => EntregaPainel,
): EntregaPainel[] {
  return entregas.map((entrega) =>
    entrega.id === id ? mudar(entrega) : entrega,
  );
}

// Move o card na hora; o servidor confirma (aplicarEstado) ou o card volta (restaurarEntrega).
export function aplicarStatusOtimista(
  entregas: readonly EntregaPainel[],
  id: string,
  para: StatusEntrega,
): EntregaPainel[] {
  return substituir(entregas, id, (entrega) => ({
    ...entrega,
    status_entrega: para,
  }));
}

export function aplicarEstado(
  entregas: readonly EntregaPainel[],
  estado: EntregaEstado,
): EntregaPainel[] {
  const terminal =
    estado.status_entrega === "entregue" ||
    estado.status_entrega === "cancelado";

  return substituir(entregas, estado.id, (entrega) => ({
    ...entrega,
    status_entrega: estado.status_entrega,
    versao: estado.versao,
    previsao_entrega_em: estado.previsao_entrega_em,
    atrasado: terminal ? false : entrega.atrasado,
  }));
}

export function restaurarEntrega(
  entregas: readonly EntregaPainel[],
  anterior: EntregaPainel,
): EntregaPainel[] {
  return substituir(entregas, anterior.id, () => anterior);
}

// Resposta do polling sem desfazer uma transição otimista ainda em andamento.
export function mesclarComPendentes(
  doServidor: readonly EntregaPainel[],
  locais: readonly EntregaPainel[],
  pendentes: ReadonlySet<string>,
): EntregaPainel[] {
  const localPorId = new Map(locais.map((entrega) => [entrega.id, entrega]));

  return doServidor.map((entrega) =>
    pendentes.has(entrega.id)
      ? (localPorId.get(entrega.id) ?? entrega)
      : entrega,
  );
}
