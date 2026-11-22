import { DescontoCard } from "../../../../components/pagamento/DescontoCard";
import { Card } from "../../../../components/ui";
import { Switch } from "../../../../components/ui/Switch";
import type { AjustesPedido as Ajustes } from "../../../../lib/cotacao-delivery";
import { formatCurrency } from "../../../../lib/format";
import type { CotacaoDelivery } from "../../../../types/delivery";

interface AjustesPedidoProps {
  ajustes: Ajustes;
  onAjustes: (ajustes: Ajustes) => void;
  // Valores vêm da cotação do backend; a tela não calcula desconto nem taxa.
  cotacao: CotacaoDelivery | null;
}

// Isenção da taxa e desconto nos itens (PED-126). Só aparece para quem tem a permissão
// de desconto; o backend confere de novo ao criar o pedido.
export function AjustesPedido({
  ajustes,
  onAjustes,
  cotacao,
}: AjustesPedidoProps) {
  const taxaBairro = cotacao?.taxa_entrega_bairro ?? null;

  return (
    <div className="flex flex-col gap-4" data-testid="ajustes-pedido">
      <Card>
        <Switch
          label="Isentar taxa de entrega"
          checked={ajustes.isentarTaxa}
          onChange={(isentarTaxa) => onAjustes({ ...ajustes, isentarTaxa })}
          description={
            taxaBairro === null
              ? "A taxa do bairro aparece quando o endereço é atendido."
              : `Taxa do bairro: ${formatCurrency(taxaBairro)}. O cliente não paga a entrega.`
          }
        />
      </Card>

      <DescontoCard
        subtotal={cotacao?.subtotal ?? 0}
        tipo={ajustes.descontoTipo}
        valor={ajustes.descontoValor}
        descontoAplicado={cotacao?.desconto_aplicado ?? 0}
        // Negativo sinaliza ao cartão que o desconto passa do valor dos itens.
        totalFinal={cotacao?.desconto_excede_itens ? -1 : (cotacao?.total ?? 0)}
        onChangeTipo={(descontoTipo) => onAjustes({ ...ajustes, descontoTipo })}
        onChangeValor={(descontoValor) =>
          onAjustes({ ...ajustes, descontoValor })
        }
      />
    </div>
  );
}
