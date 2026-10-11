import { Card } from "../../../../components/ui";
import type { SituacaoIdentificacao } from "../../../../lib/identificacao-cliente";
import type { ControleCotacaoDelivery } from "../useCotacaoDelivery";
import type { ControleEnderecoNovo } from "../useEnderecoNovo";
import { EnderecoNovoForm } from "./EnderecoNovoForm";
import { FreteCotacao } from "./FreteCotacao";

interface EnderecoEntregaProps {
  situacaoCliente: SituacaoIdentificacao;
  cadastrarEndereco: boolean;
  endereco: ControleEnderecoNovo;
  cotacao: ControleCotacaoDelivery;
}

// Bloco "Entrega" do novo pedido delivery (PED-108): formulário quando o endereço é novo
// (a escolha entre salvos fica no bloco "Cliente") e o frete cotado pelo backend.
export function EnderecoEntrega({ situacaoCliente, cadastrarEndereco, endereco, cotacao }: EnderecoEntregaProps) {
  // Enquanto o telefone não foi identificado, ainda não se sabe se o endereço é novo.
  const clienteIdentificado = situacaoCliente !== "digitando" && situacaoCliente !== "buscando";

  return (
    <Card className="flex flex-col gap-4">
      <h2 className="text-base font-semibold text-slate-900 dark:text-white">Entrega</h2>
      {clienteIdentificado && cadastrarEndereco && <EnderecoNovoForm endereco={endereco} />}
      <FreteCotacao cotacao={cotacao} />
    </Card>
  );
}
