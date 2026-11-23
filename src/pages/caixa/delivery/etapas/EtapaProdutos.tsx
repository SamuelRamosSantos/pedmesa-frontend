import type { RefObject } from "react";
import type { ControleCarrinho } from "../../../../hooks/useCarrinho";
import type { Categoria } from "../../../../types/categoria";
import type { Produto } from "../../../../types/produto";
import { CardapioDelivery } from "../components/CardapioDelivery";
import { ResumoPedidoDelivery } from "../components/ResumoPedidoDelivery";
import type { ControleCotacaoDelivery } from "../useCotacaoDelivery";

interface EtapaProdutosProps {
  produtos: Produto[];
  categorias: Categoria[];
  carregando: boolean;
  erro: string | null;
  onRecarregar: () => void;
  carrinho: ControleCarrinho;
  cotacao: ControleCotacaoDelivery;
  buscaRef: RefObject<HTMLInputElement | null>;
}

// Etapa 2 do novo pedido delivery (PED-123): cardápio e itens do pedido lado a lado.
export function EtapaProdutos({
  produtos,
  categorias,
  carregando,
  erro,
  onRecarregar,
  carrinho,
  cotacao,
  buscaRef,
}: EtapaProdutosProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
      <CardapioDelivery
        produtos={produtos}
        categorias={categorias}
        carregando={carregando}
        erro={erro}
        onRecarregar={onRecarregar}
        onAdicionar={carrinho.adicionar}
        buscaRef={buscaRef}
      />
      <div className="lg:sticky lg:top-40">
        <ResumoPedidoDelivery carrinho={carrinho} cotacao={cotacao} />
      </div>
    </div>
  );
}
