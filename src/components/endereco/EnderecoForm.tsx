import { Loader2, MapPin } from "lucide-react";
import type { ReactNode } from "react";
import type { ControleEnderecoForm } from "../../hooks/useEnderecoForm";
import type { StatusCepLookup } from "../../lib/cep-lookup";
import { Input } from "../ui/Input";

interface EnderecoFormProps {
  endereco: ControleEnderecoForm;
  // Conteúdo extra no fim (ex.: "Salvar endereço no cadastro" do delivery).
  children?: ReactNode;
}

// Aviso discreto do CEP: nunca trava o formulário, os campos ficam sempre editáveis.
const AVISO_CEP: Record<StatusCepLookup, string | null> = {
  idle: null,
  carregando: "Buscando endereço...",
  encontrado: null,
  nao_encontrado: "CEP não encontrado. Preencha o endereço manualmente.",
  falhou:
    "Não foi possível consultar o CEP agora. Preencha o endereço manualmente.",
};

// Campos de endereço com busca do CEP (PED-108): novo pedido delivery e cadastro de
// clientes (PED-124).
export function EnderecoForm({ endereco, children }: EnderecoFormProps) {
  const { campos, alterar, statusCep } = endereco;
  const aviso = AVISO_CEP[statusCep];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-[minmax(0,12rem)_1fr]">
        <Input
          ref={endereco.cepRef}
          label="CEP"
          inputMode="numeric"
          autoComplete="off"
          placeholder="00000-000"
          icon={<MapPin className="h-4 w-4" />}
          value={campos.cep}
          onChange={(evento) => alterar("cep", evento.target.value)}
        />
        <Input
          ref={endereco.logradouroRef}
          label="Logradouro"
          autoComplete="off"
          value={campos.logradouro}
          onChange={(evento) => alterar("logradouro", evento.target.value)}
        />
      </div>

      {aviso && (
        <p
          role="status"
          aria-live="polite"
          className="-mt-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400"
        >
          {statusCep === "carregando" && (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          )}
          {aviso}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-[minmax(0,8rem)_1fr]">
        <Input
          ref={endereco.numeroRef}
          label="Número"
          autoComplete="off"
          value={campos.numero}
          onChange={(evento) => alterar("numero", evento.target.value)}
        />
        <Input
          label="Complemento (opcional)"
          autoComplete="off"
          value={campos.complemento}
          onChange={(evento) => alterar("complemento", evento.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_1fr_minmax(0,5rem)]">
        <Input
          label="Bairro"
          autoComplete="off"
          value={campos.bairro}
          onChange={(evento) => alterar("bairro", evento.target.value)}
        />
        <Input
          label="Cidade"
          autoComplete="off"
          value={campos.cidade}
          onChange={(evento) => alterar("cidade", evento.target.value)}
        />
        <Input
          label="UF"
          autoComplete="off"
          maxLength={2}
          value={campos.uf}
          onChange={(evento) =>
            alterar("uf", evento.target.value.toUpperCase())
          }
        />
      </div>

      <Input
        label="Ponto de referência (opcional)"
        autoComplete="off"
        value={campos.referencia}
        onChange={(evento) => alterar("referencia", evento.target.value)}
      />

      {children}
    </div>
  );
}
