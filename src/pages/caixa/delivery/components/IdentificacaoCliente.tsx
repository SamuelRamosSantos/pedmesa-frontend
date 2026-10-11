import { AlertTriangle, Loader2, Phone, UserCheck, UserPlus } from "lucide-react";
import type { ReactNode } from "react";
import { Card, Input } from "../../../../components/ui";
import { resumoEndereco, type SituacaoIdentificacao } from "../../../../lib/identificacao-cliente";
import type { ControleIdentificacaoCliente } from "../useIdentificacaoCliente";

interface IdentificacaoClienteProps {
  identificacao: ControleIdentificacaoCliente;
}

const AVISO_POR_SITUACAO: Record<SituacaoIdentificacao, { icone: ReactNode; texto: string; classe: string }> = {
  digitando: {
    icone: null,
    texto: "Digite o telefone com DDD. A busca começa sozinha.",
    classe: "text-slate-500 dark:text-slate-400",
  },
  buscando: {
    icone: <Loader2 className="h-4 w-4 animate-spin" />,
    texto: "Buscando cliente...",
    classe: "text-slate-600 dark:text-slate-300",
  },
  encontrado: {
    icone: <UserCheck className="h-4 w-4" />,
    texto: "Cliente cadastrado",
    classe: "text-emerald-700 dark:text-emerald-400",
  },
  novo: {
    icone: <UserPlus className="h-4 w-4" />,
    texto: "Cliente novo",
    classe: "text-sky-700 dark:text-sky-400",
  },
  falhou: {
    icone: <AlertTriangle className="h-4 w-4" />,
    texto: "Não foi possível buscar o cliente. Preencha os dados para cadastrar.",
    classe: "text-amber-700 dark:text-amber-400",
  },
};

// Bloco "Cliente" do novo pedido delivery (PED-107). O estado vem de useIdentificacaoCliente.
export function IdentificacaoCliente({ identificacao }: IdentificacaoClienteProps) {
  const { situacao, cliente } = identificacao;
  const aviso = AVISO_POR_SITUACAO[situacao];
  const enderecos = cliente?.enderecos ?? [];
  const cadastroManual = situacao === "novo" || situacao === "falhou";

  return (
    <Card className="flex flex-col gap-4">
      <h2 className="text-base font-semibold text-slate-900 dark:text-white">Cliente</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          ref={identificacao.telefoneRef}
          label="Telefone"
          type="tel"
          inputMode="tel"
          autoComplete="off"
          autoFocus
          placeholder="(11) 98765-4321"
          icon={<Phone className="h-4 w-4" />}
          value={identificacao.telefone}
          onChange={(evento) => identificacao.alterarTelefone(evento.target.value)}
        />
        <Input
          ref={identificacao.nomeRef}
          label="Nome do cliente"
          autoComplete="off"
          value={identificacao.nome}
          onChange={(evento) => identificacao.alterarNome(evento.target.value)}
        />
      </div>

      <p role="status" aria-live="polite" className={`flex items-center gap-2 text-sm font-medium ${aviso.classe}`}>
        {aviso.icone}
        {aviso.texto}
      </p>

      {cliente?.observacoes && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
          <span className="font-semibold">Observação do cliente:</span> {cliente.observacoes}
        </p>
      )}

      {enderecos.length > 0 && (
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">Endereço de entrega</legend>
          {enderecos.map((endereco) => (
            <OpcaoEndereco
              key={endereco.id}
              valor={endereco.id}
              selecionada={identificacao.escolhaEndereco === endereco.id}
              onEscolher={identificacao.escolherEndereco}
            >
              <span className="font-medium text-slate-900 dark:text-white">{resumoEndereco(endereco)}</span>
              <span className="text-slate-500 dark:text-slate-400">
                {endereco.bairro} · {endereco.cidade}/{endereco.uf}
              </span>
              {endereco.principal && (
                <span className="ml-auto rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700 dark:bg-orange-950/40 dark:text-orange-300">
                  Principal
                </span>
              )}
            </OpcaoEndereco>
          ))}
          <OpcaoEndereco
            valor="novo"
            selecionada={identificacao.escolhaEndereco === "novo"}
            onEscolher={identificacao.escolherEndereco}
          >
            <span className="font-medium text-slate-900 dark:text-white">Novo endereço</span>
          </OpcaoEndereco>
        </fieldset>
      )}

      {cadastroManual && (
        <p className="text-sm text-slate-500 dark:text-slate-400">Cadastre o endereço de entrega abaixo.</p>
      )}
    </Card>
  );
}

interface OpcaoEnderecoProps {
  valor: string;
  selecionada: boolean;
  onEscolher: (valor: string) => void;
  children: ReactNode;
}

function OpcaoEndereco({ valor, selecionada, onEscolher, children }: OpcaoEnderecoProps) {
  return (
    <label
      className={`flex cursor-pointer flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border px-3.5 py-2.5 text-sm transition-colors ${
        selecionada
          ? "border-orange-500 bg-orange-50 dark:border-orange-500/70 dark:bg-orange-950/20"
          : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600"
      }`}
    >
      <input
        type="radio"
        name="endereco-entrega"
        value={valor}
        checked={selecionada}
        onChange={() => onEscolher(valor)}
        className="accent-orange-600"
      />
      {children}
    </label>
  );
}
