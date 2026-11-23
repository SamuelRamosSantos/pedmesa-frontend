import { ArrowLeft, Phone, UserCheck, UserPlus } from "lucide-react";
import { Button, Card, Input } from "../../../../components/ui";
import { mascararTelefone } from "../../../../lib/mascaras";
import { CLASSES_DO_TOM } from "../../../../lib/tons";
import { BuscaCliente } from "../components/BuscaCliente";
import { EnderecoEntrega } from "../components/EnderecoEntrega";
import type { ControleBuscaCliente } from "../useBuscaCliente";
import type { ControleCotacaoDelivery } from "../useCotacaoDelivery";
import type { ControleEnderecoNovo } from "../useEnderecoNovo";

interface EtapaClienteProps {
  busca: ControleBuscaCliente;
  endereco: ControleEnderecoNovo;
  cotacao: ControleCotacaoDelivery;
}

// Etapa 1 do novo pedido delivery (PED-123, PED-139): quem é o cliente e onde entregar.
export function EtapaCliente({ busca, endereco, cotacao }: EtapaClienteProps) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <Card className="flex flex-col gap-4">
        <h2 className="text-titulo-secao text-slate-900 dark:text-white">
          Cliente
        </h2>
        {busca.modo === "busca" && <BuscaCliente busca={busca} />}
        {busca.modo === "selecionado" && <ClienteSelecionado busca={busca} />}
        {busca.modo === "novo" && <ClienteNovo busca={busca} />}
      </Card>

      {busca.modo !== "busca" && (
        <EnderecoEntrega busca={busca} endereco={endereco} cotacao={cotacao} />
      )}
    </div>
  );
}

function ClienteSelecionado({ busca }: { busca: ControleBuscaCliente }) {
  const cliente = busca.selecionado;

  if (cliente === null) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        data-testid="cliente-selecionado"
        className={`flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border px-4 py-3 ${CLASSES_DO_TOM.sucesso.superficie}`}
      >
        <UserCheck
          className={`h-5 w-5 shrink-0 ${CLASSES_DO_TOM.sucesso.texto}`}
        />
        <div className="min-w-0 flex-1">
          <p className="text-corpo font-semibold text-slate-900 dark:text-white">
            {cliente.nome}
          </p>
          <p className="whitespace-nowrap text-corpo tabular-nums text-slate-600 dark:text-slate-300">
            {mascararTelefone(cliente.telefone)}
          </p>
        </div>
        <Button variant="ghost" onClick={busca.voltarParaBusca}>
          Trocar cliente
        </Button>
      </div>

      {cliente.observacoes && (
        <p
          className={`rounded-lg border px-3 py-2 text-corpo ${CLASSES_DO_TOM.aviso.superficie}`}
        >
          <span className="font-semibold">Observação do cliente:</span>{" "}
          {cliente.observacoes}
        </p>
      )}
    </div>
  );
}

function ClienteNovo({ busca }: { busca: ControleBuscaCliente }) {
  const existente = busca.telefoneJaCadastrado;

  return (
    <div className="flex flex-col gap-4">
      <p
        className={`flex items-center gap-2 text-corpo font-medium ${CLASSES_DO_TOM.andamento.texto}`}
      >
        <UserPlus className="h-4 w-4" />
        Cliente novo
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          ref={busca.nomeRef}
          label="Nome do cliente"
          autoComplete="off"
          value={busca.cadastro.nome}
          onChange={(evento) =>
            busca.alterarCadastro("nome", evento.target.value)
          }
          data-testid="cadastro-nome"
        />
        <Input
          ref={busca.telefoneRef}
          label="Telefone"
          type="tel"
          inputMode="tel"
          autoComplete="off"
          placeholder="(11) 98765-4321"
          icon={<Phone className="h-4 w-4" />}
          value={busca.cadastro.telefone}
          onChange={(evento) =>
            busca.alterarCadastro("telefone", evento.target.value)
          }
          data-testid="cadastro-telefone"
        />
      </div>

      {existente && (
        <div
          role="status"
          className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border px-3.5 py-2.5 text-corpo ${CLASSES_DO_TOM.aviso.superficie}`}
        >
          <span>
            Este telefone já está cadastrado para{" "}
            <strong>{existente.nome}</strong>.
          </span>
          <Button
            variant="secondary"
            onClick={() => busca.selecionar(existente)}
          >
            Usar este cadastro
          </Button>
        </div>
      )}

      <button
        type="button"
        onClick={busca.voltarParaBusca}
        className="flex w-fit items-center gap-2 rounded-lg px-2 py-1.5 text-corpo font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para a busca
      </button>
    </div>
  );
}
