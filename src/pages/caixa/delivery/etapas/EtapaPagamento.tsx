import { ClipboardCheck, Send } from "lucide-react";
import type { RefObject } from "react";
import { Button, Card } from "../../../../components/ui";
import type { ControleCarrinho } from "../../../../hooks/useCarrinho";
import type { AjustesPedido as Ajustes } from "../../../../lib/cotacao-delivery";
import { FORMA_PAGAMENTO_LABEL } from "../../../../lib/forma-pagamento";
import { formatCurrency } from "../../../../lib/format";
import { mascararTelefone } from "../../../../lib/mascaras";
import { CLASSES_DO_TOM } from "../../../../lib/tons";
import type { FormaPagamento } from "../../../../types/comanda";
import { AjustesPedido } from "../components/AjustesPedido";
import { PagamentoDelivery } from "../components/PagamentoDelivery";
import { ValoresPedido } from "../components/ValoresPedido";
import type { ControleCotacaoDelivery } from "../useCotacaoDelivery";

export interface ResumoEntrega {
  nome: string;
  // Só dígitos.
  telefone: string;
  endereco: string;
}

interface EtapaPagamentoProps {
  forma: FormaPagamento;
  onForma: (forma: FormaPagamento) => void;
  trocoParaCents: number;
  onTrocoParaCents: (cents: number) => void;
  carrinho: ControleCarrinho;
  cotacao: ControleCotacaoDelivery;
  entrega: ResumoEntrega | null;
  motivoBloqueio: string | null;
  enviando: boolean;
  onEnviar: () => void;
  enviarRef: RefObject<HTMLButtonElement | null>;
  // Desconto e isenção da taxa (PED-126): só com a permissão de desconto.
  podeAjustar: boolean;
  ajustes: Ajustes;
  onAjustes: (ajustes: Ajustes) => void;
}

function Bloco({ titulo, children }: { titulo: string; children: string }) {
  return (
    <div>
      <p className="text-legenda font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {titulo}
      </p>
      <p className="text-corpo text-slate-900 dark:text-white">{children}</p>
    </div>
  );
}

// Etapa 3 do novo pedido delivery (PED-123, PED-139): forma de pagamento, troco e a
// revisão do pedido antes de enviar. Todos os valores são os da cotação do backend.
export function EtapaPagamento({
  forma,
  onForma,
  trocoParaCents,
  onTrocoParaCents,
  carrinho,
  cotacao,
  entrega,
  motivoBloqueio,
  enviando,
  onEnviar,
  enviarRef,
  podeAjustar,
  ajustes,
  onAjustes,
}: EtapaPagamentoProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
      <div className="flex min-w-0 flex-col gap-4">
        <PagamentoDelivery
          forma={forma}
          onForma={onForma}
          trocoParaCents={trocoParaCents}
          onTrocoParaCents={onTrocoParaCents}
          cotacao={cotacao.cotacao}
        />
        {podeAjustar && (
          <AjustesPedido
            ajustes={ajustes}
            onAjustes={onAjustes}
            cotacao={cotacao.cotacao}
          />
        )}
      </div>

      <Card className="flex flex-col gap-4 lg:sticky lg:top-40">
        <h2 className="flex items-center gap-2 text-titulo-secao text-slate-900 dark:text-white">
          <ClipboardCheck className="h-4 w-4" />
          Revisão do pedido
        </h2>

        {entrega && (
          <div className="flex flex-col gap-3">
            <Bloco titulo="Cliente">
              {`${entrega.nome} · ${mascararTelefone(entrega.telefone)}`}
            </Bloco>
            <Bloco titulo="Entregar em">{entrega.endereco}</Bloco>
            <Bloco titulo="Pagamento">{FORMA_PAGAMENTO_LABEL[forma]}</Bloco>
          </div>
        )}

        <ul className="flex flex-col gap-1.5 border-t border-slate-200 pt-3 text-corpo dark:border-slate-800">
          {carrinho.itens.map((item) => (
            <li
              key={item.id}
              className="flex items-start justify-between gap-3"
            >
              <span className="text-slate-700 dark:text-slate-300">
                <span className="font-semibold tabular-nums">
                  {item.quantidade}×
                </span>{" "}
                {item.produtoNome}
                {item.observacao.trim() !== "" && (
                  <span className="block text-legenda text-slate-500 dark:text-slate-400">
                    {item.observacao}
                  </span>
                )}
              </span>
              <span className="shrink-0 tabular-nums text-slate-600 dark:text-slate-300">
                {formatCurrency(item.precoUnitario * item.quantidade)}
              </span>
            </li>
          ))}
        </ul>

        <ValoresPedido cotacao={cotacao} />

        {motivoBloqueio && (
          <p
            className={`text-corpo ${CLASSES_DO_TOM.aviso.texto}`}
            role="status"
          >
            {motivoBloqueio}
          </p>
        )}

        <Button
          ref={enviarRef}
          onClick={onEnviar}
          isLoading={enviando}
          className="w-full"
          data-testid="botao-enviar-pedido"
        >
          <Send className="h-4 w-4" />
          Enviar pedido
          <kbd className="ml-1 rounded bg-white/20 px-1.5 py-0.5 text-legenda font-medium">
            Ctrl+Enter
          </kbd>
        </Button>
      </Card>
    </div>
  );
}
