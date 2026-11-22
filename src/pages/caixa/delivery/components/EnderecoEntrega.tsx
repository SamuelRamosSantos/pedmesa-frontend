import { MapPin, MapPinPlus } from "lucide-react";
import { useState } from "react";
import { TaxaEntregaModal } from "../../../../components/delivery/TaxaEntregaModal";
import { Button, Card } from "../../../../components/ui";
import { OpcaoSelecionavel } from "../../../../components/ui/OpcaoSelecionavel";
import { useAuth } from "../../../../contexts/AuthContext";
import { localidadeDaEntrega } from "../../../../lib/endereco-entrega";
import { resumoEndereco } from "../../../../lib/identificacao-cliente";
import type { ControleBuscaCliente } from "../useBuscaCliente";
import type { ControleCotacaoDelivery } from "../useCotacaoDelivery";
import type { ControleEnderecoNovo } from "../useEnderecoNovo";
import { EnderecoNovoForm } from "./EnderecoNovoForm";
import { FreteCotacao } from "./FreteCotacao";

interface EnderecoEntregaProps {
  busca: ControleBuscaCliente;
  endereco: ControleEnderecoNovo;
  cotacao: ControleCotacaoDelivery;
}

// Bloco "Endereço de entrega" da etapa Cliente (PED-108; seleção por cartões desde o
// PED-123): endereços salvos do cliente, cadastro de um novo e o frete cotado pelo backend.
// Bairro não atendido: o admin cadastra a taxa ali mesmo e a cotação é refeita (PED-125).
export function EnderecoEntrega({
  busca,
  endereco,
  cotacao,
}: EnderecoEntregaProps) {
  const { user } = useAuth();
  // Só o admin cadastra bairros (o backend recusa os outros papéis).
  const ehAdmin = user?.roles.includes("admin") ?? false;
  const [cadastrandoBairro, setCadastrandoBairro] = useState(false);
  const enderecos = busca.selecionado?.enderecos ?? [];
  const cadastrarEndereco = busca.escolhaEndereco === "novo";
  const localidade = localidadeDaEntrega(
    busca.selecionado,
    busca.escolhaEndereco,
    endereco.campos,
  );

  return (
    <Card className="flex flex-col gap-4">
      <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white">
        <MapPin className="h-4 w-4 text-slate-400" />
        Endereço de entrega
      </h2>

      {busca.modo === "selecionado" && enderecos.length > 0 && (
        <fieldset className="flex flex-col gap-2" aria-label="Endereços salvos">
          {enderecos.map((salvo) => (
            <OpcaoSelecionavel
              key={salvo.id}
              selecionada={busca.escolhaEndereco === salvo.id}
              onClick={() => busca.escolherEndereco(salvo.id)}
              data-testid={`opcao-endereco-${salvo.id}`}
            >
              <span className="font-medium text-slate-900 dark:text-white">
                {resumoEndereco(salvo)}
              </span>
              <span className="text-slate-500 dark:text-slate-400">
                {salvo.bairro} · {salvo.cidade}/{salvo.uf}
              </span>
              {salvo.principal && (
                <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700 dark:bg-orange-950/40 dark:text-orange-300">
                  Principal
                </span>
              )}
            </OpcaoSelecionavel>
          ))}
          <OpcaoSelecionavel
            selecionada={cadastrarEndereco}
            onClick={() => busca.escolherEndereco("novo")}
            data-testid="opcao-endereco-novo"
          >
            <span className="font-medium text-slate-900 dark:text-white">
              Entregar em outro endereço
            </span>
          </OpcaoSelecionavel>
        </fieldset>
      )}

      {cadastrarEndereco && <EnderecoNovoForm endereco={endereco} />}

      <FreteCotacao
        cotacao={cotacao}
        acaoBairroNaoAtendido={
          localidade === null ? null : ehAdmin ? (
            <Button
              variant="secondary"
              onClick={() => setCadastrandoBairro(true)}
              data-testid="botao-cadastrar-bairro"
              className="w-fit"
            >
              <MapPinPlus className="h-4 w-4" />
              Cadastrar o bairro {localidade.bairro}
            </Button>
          ) : (
            <p className="font-normal">
              Peça ao administrador para cadastrar este bairro em Bairros e
              taxas.
            </p>
          )
        }
      />

      {cadastrandoBairro && localidade && (
        <TaxaEntregaModal
          taxa={null}
          cidadePadrao={localidade.cidade}
          bairroPadrao={localidade.bairro}
          onClose={() => setCadastrandoBairro(false)}
          onSaved={() => {
            setCadastrandoBairro(false);
            cotacao.recotar();
          }}
        />
      )}
    </Card>
  );
}
