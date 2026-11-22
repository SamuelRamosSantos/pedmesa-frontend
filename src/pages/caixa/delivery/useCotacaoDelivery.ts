import { useCallback } from "react";
import { useComAtraso } from "../../../hooks/useComAtraso";
import { useConsultaPorChave } from "../../../hooks/useConsultaPorChave";
import {
  bloqueioDoEnvio,
  type EntradaCotacao,
  payloadDaCotacao,
  type SituacaoCotacao,
  situacaoDaCotacao,
} from "../../../lib/cotacao-delivery";
import { cotarPedidoDelivery } from "../../../services/delivery.service";
import type { CotacaoDelivery } from "../../../types/delivery";

// Espera o atendente parar de digitar (bairro, quantidade) antes de cotar de novo.
const ATRASO_COTACAO_MS = 400;

export interface ControleCotacaoDelivery {
  situacao: SituacaoCotacao;
  // Última cotação do backend para o pedido atual (null sem endereço, ou se falhou).
  cotacao: CotacaoDelivery | null;
  // Motivo que impede enviar (bairro não atendido), ou null.
  bloqueio: string | null;
}

// Cotação do pedido delivery (PED-108; o resumo da PED-109 usa a mesma): refaz a cada
// mudança de endereço, itens ou pagamento, com debounce. A UI não calcula frete.
export function useCotacaoDelivery(
  entrada: EntradaCotacao,
): ControleCotacaoDelivery {
  const payload = payloadDaCotacao(entrada);
  const chaveAtual = payload === null ? null : JSON.stringify(payload);
  const comAtraso = useComAtraso(payload, chaveAtual ?? "", ATRASO_COTACAO_MS);
  const payloadAtrasado = comAtraso.valor;

  const cotar = useCallback(
    (_chave: string, signal: AbortSignal) =>
      payloadAtrasado === null
        ? Promise.reject(new Error("Sem endereço para cotar."))
        : cotarPedidoDelivery(payloadAtrasado, signal),
    [payloadAtrasado],
  );

  // Só cota quando o pedido parou de mudar (valor atual = valor com atraso). Enquanto o
  // debounce corre, nada é consultado: senão o pedido anterior, ainda guardado no atraso,
  // seria cotado de novo.
  const aguardandoDigitacao =
    chaveAtual !== null && chaveAtual !== comAtraso.chave;
  const consulta = useConsultaPorChave(
    chaveAtual === null || aguardandoDigitacao ? null : chaveAtual,
    cotar,
  );
  const situacao = situacaoDaCotacao(consulta, aguardandoDigitacao);
  const cotacao =
    situacao === "atendido" || situacao === "nao_atendido"
      ? consulta.valor
      : null;

  return { situacao, cotacao, bloqueio: bloqueioDoEnvio(cotacao) };
}
