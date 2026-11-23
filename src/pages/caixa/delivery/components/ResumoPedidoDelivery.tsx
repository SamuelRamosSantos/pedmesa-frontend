import { ShoppingCart } from "lucide-react";
import { LinhaCarrinho } from "../../../../components/carrinho/LinhaCarrinho";
import { Card } from "../../../../components/ui";
import type { ControleCarrinho } from "../../../../hooks/useCarrinho";
import type { ControleCotacaoDelivery } from "../useCotacaoDelivery";
import { ValoresPedido } from "./ValoresPedido";

interface ResumoPedidoDeliveryProps {
  carrinho: ControleCarrinho;
  cotacao: ControleCotacaoDelivery;
}

// Itens do pedido, editáveis, com os valores da cotação do backend (etapa Produtos).
export function ResumoPedidoDelivery({
  carrinho,
  cotacao,
}: ResumoPedidoDeliveryProps) {
  return (
    <Card className="flex flex-col gap-4">
      <h2 className="flex items-center gap-2 text-titulo-secao text-slate-900 dark:text-white">
        <ShoppingCart className="h-4 w-4" />
        Itens do pedido
        {carrinho.quantidadeTotal > 0 && (
          <span className="text-corpo font-normal text-slate-500 dark:text-slate-400">
            ({carrinho.quantidadeTotal}{" "}
            {carrinho.quantidadeTotal === 1 ? "item" : "itens"})
          </span>
        )}
      </h2>

      {carrinho.itens.length === 0 ? (
        <p className="py-4 text-center text-corpo text-slate-500 dark:text-slate-400">
          Nenhum item ainda. Busque um produto e tecle Enter para adicionar.
        </p>
      ) : (
        <div className="flex max-h-[26rem] flex-col gap-3 overflow-y-auto pr-1">
          {carrinho.itens.map((item) => (
            <LinhaCarrinho
              key={item.id}
              item={item}
              onAlterar={carrinho.alterar}
              onRemover={carrinho.remover}
            />
          ))}
        </div>
      )}

      <ValoresPedido cotacao={cotacao} />
    </Card>
  );
}
