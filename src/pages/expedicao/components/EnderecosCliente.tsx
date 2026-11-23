import { MapPin, Plus } from "lucide-react";
import { useState } from "react";
import { EnderecoForm } from "../../../components/endereco/EnderecoForm";
import { Button } from "../../../components/ui/Button";
import { ItemEditavel } from "../../../components/ui/ItemEditavel";
import { RodapeEdicao } from "../../../components/ui/RodapeEdicao";
import { Selo } from "../../../components/ui/Selo";
import { Switch } from "../../../components/ui/Switch";
import { useToast } from "../../../contexts/ToastContext";
import { useEnderecoForm } from "../../../hooks/useEnderecoForm";
import { getApiErrorMessage } from "../../../lib/api-error";
import {
  CAMPOS_ENDERECO_VAZIOS,
  type CamposEndereco,
  camposDoEnderecoSalvo,
} from "../../../lib/endereco-entrega";
import { resumoEndereco } from "../../../lib/identificacao-cliente";
import { CLASSES_DO_TOM } from "../../../lib/tons";
import {
  buscarClientePorTelefone,
  createEnderecoCliente,
  deleteEnderecoCliente,
  updateEnderecoCliente,
} from "../../../services/cliente.service";
import type { EnderecoNovoPayload } from "../../../services/delivery.service";
import type { Cliente, EnderecoCliente } from "../../../types/cliente";

interface EnderecosClienteProps {
  cliente: Cliente;
  // Cliente relido do backend depois de cada alteração (a ordem e o principal são dele).
  onAlterado: (cliente: Cliente) => void;
}

// Endereços de um cliente na tela de clientes (PED-124, PED-135): clicar na linha do
// endereço abre o editor com os campos, a opção de tornar principal e a exclusão com
// confirmação nomeando o endereço.
export function EnderecosCliente({
  cliente,
  onAlterado,
}: EnderecosClienteProps) {
  const { showToast } = useToast();
  // id do endereço em edição, "novo" ou null.
  const [editando, setEditando] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [excluindoId, setExcluindoId] = useState<string | null>(null);

  function fecharEdicao(idParaFocar?: string) {
    setEditando(null);
    if (idParaFocar) {
      requestAnimationFrame(() =>
        document
          .querySelector<HTMLButtonElement>(
            `[data-testid="endereco-${idParaFocar}"]`,
          )
          ?.focus(),
      );
    }
  }

  async function executar(
    id: string,
    acao: () => Promise<unknown>,
    sucesso: string,
    falha: string,
  ): Promise<boolean> {
    setOcupado(id);

    try {
      await acao();
      const atualizado = await buscarClientePorTelefone(cliente.telefone);

      if (atualizado) {
        onAlterado(atualizado);
      }
      showToast(sucesso, "success");
      return true;
    } catch (error) {
      showToast(getApiErrorMessage(error, falha), "error");
      return false;
    } finally {
      setOcupado(null);
    }
  }

  async function salvar(
    endereco: EnderecoNovoPayload,
    tornarPrincipal: boolean,
  ) {
    const alvo = editando ?? "novo";
    const novo = alvo === "novo";
    const ok = await executar(
      alvo,
      () =>
        novo
          ? createEnderecoCliente(cliente.id, {
              ...endereco,
              ...(tornarPrincipal ? { principal: true } : {}),
            })
          : updateEnderecoCliente(cliente.id, alvo, {
              ...endereco,
              ...(tornarPrincipal ? { principal: true } : {}),
            }),
      novo ? "Endereço adicionado." : "Endereço atualizado.",
      "Não foi possível salvar o endereço.",
    );

    if (ok) {
      fecharEdicao(novo ? undefined : alvo);
    }
  }

  async function excluir(endereco: EnderecoCliente) {
    const resumo = resumoEndereco(endereco);
    setExcluindoId(endereco.id);

    try {
      await deleteEnderecoCliente(cliente.id, endereco.id);
      const atualizado = await buscarClientePorTelefone(cliente.telefone);
      if (atualizado) {
        onAlterado(atualizado);
      }
      showToast(`Endereço ${resumo} excluído.`, "success");
      setEditando(null);
    } catch (error) {
      showToast(
        getApiErrorMessage(error, "Não foi possível excluir o endereço."),
        "error",
      );
    } finally {
      setExcluindoId(null);
    }
  }

  return (
    <section className="flex flex-col gap-3" aria-labelledby="titulo-enderecos">
      <div className="flex items-center justify-between gap-3">
        <h3
          id="titulo-enderecos"
          className="flex items-center gap-2 text-titulo-secao text-slate-900 dark:text-white"
        >
          <MapPin className="h-4 w-4 text-slate-400" />
          Endereços
        </h3>
        {editando === null && (
          <Button
            variant="secondary"
            onClick={() => setEditando("novo")}
            data-testid="botao-adicionar-endereco"
          >
            <Plus className="h-4 w-4" />
            Adicionar endereço
          </Button>
        )}
      </div>

      {cliente.enderecos.length === 0 && editando !== "novo" && (
        <p className="rounded-lg border border-dashed border-slate-300 px-4 py-3 text-corpo text-slate-500 dark:border-slate-700 dark:text-slate-400">
          Nenhum endereço salvo. Os endereços também entram aqui quando o pedido
          é feito com "Salvar endereço no cadastro".
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {cliente.enderecos.map((endereco) =>
          editando === endereco.id ? (
            <li key={endereco.id}>
              <EditorEndereco
                inicial={camposDoEnderecoSalvo(endereco)}
                enderecoSalvo={endereco}
                salvando={ocupado === endereco.id}
                excluindo={excluindoId === endereco.id}
                onCancelar={() => fecharEdicao(endereco.id)}
                onSalvar={salvar}
                onExcluir={() => void excluir(endereco)}
              />
            </li>
          ) : (
            <LinhaEndereco
              key={endereco.id}
              endereco={endereco}
              bloqueado={editando !== null}
              onEditar={() => setEditando(endereco.id)}
            />
          ),
        )}
      </ul>

      {editando === "novo" && (
        <EditorEndereco
          inicial={CAMPOS_ENDERECO_VAZIOS}
          salvando={ocupado === "novo"}
          onCancelar={() => fecharEdicao()}
          onSalvar={salvar}
        />
      )}
    </section>
  );
}

interface LinhaEnderecoProps {
  endereco: EnderecoCliente;
  // Outro endereço está em edição: a linha fica indisponível.
  bloqueado: boolean;
  onEditar: () => void;
}

function LinhaEndereco({ endereco, bloqueado, onEditar }: LinhaEnderecoProps) {
  const resumo = resumoEndereco(endereco);

  return (
    <li>
      <ItemEditavel
        variante="linha"
        disabled={bloqueado}
        data-testid={`endereco-${endereco.id}`}
        aria-label={`Editar endereço ${resumo}`}
        onClick={onEditar}
      >
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2 font-medium text-slate-900 dark:text-white">
            {resumo}
            {endereco.principal && <Selo tom="marca">Principal</Selo>}
          </p>
          <p className="text-corpo text-slate-500 dark:text-slate-400">
            {endereco.bairro} · {endereco.cidade}/{endereco.uf}
            {endereco.referencia && ` · ${endereco.referencia}`}
          </p>
        </div>
      </ItemEditavel>
    </li>
  );
}

interface EditorEnderecoProps {
  inicial: CamposEndereco;
  enderecoSalvo?: EnderecoCliente;
  salvando: boolean;
  excluindo?: boolean;
  onCancelar: () => void;
  onSalvar: (endereco: EnderecoNovoPayload, tornarPrincipal: boolean) => void;
  onExcluir?: () => void;
}

function EditorEndereco({
  inicial,
  enderecoSalvo,
  salvando,
  excluindo = false,
  onCancelar,
  onSalvar,
  onExcluir,
}: EditorEnderecoProps) {
  const endereco = useEnderecoForm(inicial);
  const [tentou, setTentou] = useState(false);
  const [tornarPrincipal, setTornarPrincipal] = useState(
    () => enderecoSalvo?.principal ?? false,
  );
  const resumo = enderecoSalvo ? resumoEndereco(enderecoSalvo) : "";

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-marca-200 bg-marca-50/40 p-4 dark:border-marca-900/50 dark:bg-marca-950/10">
      <EnderecoForm endereco={endereco} />

      {enderecoSalvo && !enderecoSalvo.principal && (
        <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
          <Switch
            checked={tornarPrincipal}
            onChange={setTornarPrincipal}
            label="Endereço principal"
            description="Usado como padrão nos próximos pedidos deste cliente."
          />
        </div>
      )}

      {tentou && endereco.endereco === null && (
        <p role="status" className={`text-corpo ${CLASSES_DO_TOM.aviso.texto}`}>
          Preencha CEP, logradouro, número, bairro, cidade e UF.
        </p>
      )}

      <RodapeEdicao
        onCancelar={onCancelar}
        salvando={salvando}
        rotuloSalvar="Salvar endereço"
        onSalvar={() => {
          setTentou(true);
          if (endereco.endereco !== null) {
            onSalvar(
              endereco.endereco,
              Boolean(
                enderecoSalvo && !enderecoSalvo.principal && tornarPrincipal,
              ),
            );
          }
        }}
        excluir={
          enderecoSalvo && onExcluir
            ? {
                confirmacao: (
                  <span>
                    Excluir o endereço <strong>{resumo}</strong>?
                    {enderecoSalvo.principal &&
                      " O endereço mais recente passa a ser o principal."}{" "}
                    Pedidos já feitos não mudam.
                  </span>
                ),
                rotuloConfirmar: "Excluir endereço",
                excluindo,
                onConfirmar: onExcluir,
              }
            : undefined
        }
      />
    </div>
  );
}
