import { Loader2, Send, ShoppingCart } from "lucide-react";
import { LinhaCarrinho } from "../../../../components/carrinho/LinhaCarrinho";
import { Button, Card } from "../../../../components/ui";
import type { ControleCarrinho } from "../../../../hooks/useCarrinho";
import { formatCurrency } from "../../../../lib/format";
import type { ControleCotacaoDelivery } from "../useCotacaoDelivery";

interface ResumoPedidoDeliveryProps {
  carrinho: ControleCarrinho;
  cotacao: ControleCotacaoDelivery;
  motivoBloqueio: string | null;
  enviando: boolean;
  onEnviar: () => void;
}

function Linha({ rotulo, valor, destaque = false }: { rotulo: string; valor: string; destaque?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${destaque ? "text-base font-bold text-slate-900 dark:text-white" : "text-sm text-slate-600 dark:text-slate-300"}`}>
      <span>{rotulo}</span>
      <span>{valor}</span>
    </div>
  );
}

// Itens e valores do pedido (PED-109). Subtotal, taxa e total são os da cotação do backend.
export function ResumoPedidoDelivery({ carrinho, cotacao, motivoBloqueio, enviando, onEnviar }: ResumoPedidoDeliveryProps) {
  const valores = cotacao.cotacao;
  const calculando = cotacao.situacao === "calculando";
  const exibir = (valor: number | null | undefined) => (valor === null || valor === undefined ? "—" : formatCurrency(valor));

  return (
    <Card className="flex flex-col gap-4">
      <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white">
        <ShoppingCart className="h-4 w-4" />
        Pedido
        {carrinho.quantidadeTotal > 0 && (
          <span className="text-sm font-normal text-slate-500 dark:text-slate-400">
            ({carrinho.quantidadeTotal} {carrinho.quantidadeTotal === 1 ? "item" : "itens"})
          </span>
        )}
      </h2>

      {carrinho.itens.length === 0 ? (
        <p className="py-4 text-center text-sm text-slate-400 dark:text-slate-500">Nenhum item adicionado.</p>
      ) : (
        <div className="flex max-h-80 flex-col gap-3 overflow-y-auto pr-1">
          {carrinho.itens.map((item) => (
            <LinhaCarrinho key={item.id} item={item} onAlterar={carrinho.alterar} onRemover={carrinho.remover} />
          ))}
        </div>
      )}

      <div className="flex flex-col gap-1.5 border-t border-slate-200 pt-3 dark:border-slate-800" aria-live="polite">
        {calculando ? (
          <p className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Calculando...
          </p>
        ) : (
          <>
            <Linha rotulo="Subtotal" valor={exibir(valores?.subtotal)} />
            <Linha rotulo="Taxa de entrega" valor={exibir(valores?.taxa_entrega)} />
            <Linha rotulo="Total" valor={exibir(valores?.total)} destaque />
          </>
        )}
      </div>

      {motivoBloqueio && !calculando && (
        <p className="text-sm text-amber-700 dark:text-amber-400" role="status">
          {motivoBloqueio}
        </p>
      )}

      <Button onClick={onEnviar} isLoading={enviando} disabled={motivoBloqueio !== null} className="w-full">
        <Send className="h-4 w-4" />
        Enviar pedido
        <kbd className="ml-1 rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-medium">Ctrl+Enter</kbd>
      </Button>
    </Card>
  );
}
