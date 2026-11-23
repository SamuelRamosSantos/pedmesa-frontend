import { MapPin, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import { EnderecoForm } from "../../../components/endereco/EnderecoForm";
import { Button } from "../../../components/ui/Button";
import { useToast } from "../../../contexts/ToastContext";
import { useEnderecoForm } from "../../../hooks/useEnderecoForm";
import { getApiErrorMessage } from "../../../lib/api-error";
import {
  CAMPOS_ENDERECO_VAZIOS,
  type CamposEndereco,
  camposDoEnderecoSalvo,
} from "../../../lib/endereco-entrega";
import { resumoEndereco } from "../../../lib/identificacao-cliente";
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

// Endereços de um cliente na tela de clientes (PED-124): adicionar, editar, tornar
// principal e excluir. Excluir pede confirmação na própria linha, nomeando o endereço.
export function EnderecosCliente({
  cliente,
  onAlterado,
}: EnderecosClienteProps) {
  const { showToast } = useToast();
  // id do endereço em edição, "novo" ou null.
  const [editando, setEditando] = useState<string | null>(null);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState<string | null>(
    null,
  );
  const [ocupado, setOcupado] = useState<string | null>(null);

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

  async function salvar(endereco: EnderecoNovoPayload) {
    const novo = editando === "novo";
    const ok = await executar(
      editando ?? "novo",
      () =>
        novo
          ? createEnderecoCliente(cliente.id, endereco)
          : updateEnderecoCliente(cliente.id, editando ?? "", endereco),
      novo ? "Endereço adicionado." : "Endereço atualizado.",
      "Não foi possível salvar o endereço.",
    );

    if (ok) {
      setEditando(null);
    }
  }

  return (
    <section className="flex flex-col gap-3" aria-labelledby="titulo-enderecos">
      <div className="flex items-center justify-between gap-3">
        <h3
          id="titulo-enderecos"
          className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white"
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
        <p className="rounded-lg border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
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
                salvando={ocupado === endereco.id}
                onCancelar={() => setEditando(null)}
                onSalvar={salvar}
              />
            </li>
          ) : (
            <LinhaEndereco
              key={endereco.id}
              endereco={endereco}
              ocupado={ocupado === endereco.id}
              confirmando={confirmandoExclusao === endereco.id}
              bloqueado={editando !== null}
              onEditar={() => {
                setConfirmandoExclusao(null);
                setEditando(endereco.id);
              }}
              onTornarPrincipal={() =>
                void executar(
                  endereco.id,
                  () =>
                    updateEnderecoCliente(cliente.id, endereco.id, {
                      principal: true,
                    }),
                  `${resumoEndereco(endereco)} agora é o endereço principal.`,
                  "Não foi possível trocar o endereço principal.",
                )
              }
              onPedirExclusao={() => setConfirmandoExclusao(endereco.id)}
              onCancelarExclusao={() => setConfirmandoExclusao(null)}
              onExcluir={() =>
                void executar(
                  endereco.id,
                  () => deleteEnderecoCliente(cliente.id, endereco.id),
                  `Endereço ${resumoEndereco(endereco)} excluído.`,
                  "Não foi possível excluir o endereço.",
                ).then(() => setConfirmandoExclusao(null))
              }
            />
          ),
        )}
      </ul>

      {editando === "novo" && (
        <EditorEndereco
          inicial={CAMPOS_ENDERECO_VAZIOS}
          salvando={ocupado === "novo"}
          onCancelar={() => setEditando(null)}
          onSalvar={salvar}
        />
      )}
    </section>
  );
}

interface LinhaEnderecoProps {
  endereco: EnderecoCliente;
  ocupado: boolean;
  confirmando: boolean;
  // Outro endereço está em edição: as ações ficam indisponíveis.
  bloqueado: boolean;
  onEditar: () => void;
  onTornarPrincipal: () => void;
  onPedirExclusao: () => void;
  onCancelarExclusao: () => void;
  onExcluir: () => void;
}

function LinhaEndereco({
  endereco,
  ocupado,
  confirmando,
  bloqueado,
  onEditar,
  onTornarPrincipal,
  onPedirExclusao,
  onCancelarExclusao,
  onExcluir,
}: LinhaEnderecoProps) {
  const resumo = resumoEndereco(endereco);

  return (
    <li
      data-testid={`endereco-${endereco.id}`}
      className="flex flex-col gap-3 rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-700"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2 font-medium text-slate-900 dark:text-white">
            {resumo}
            {endereco.principal && (
              <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700 dark:bg-orange-950/40 dark:text-orange-300">
                Principal
              </span>
            )}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {endereco.bairro} · {endereco.cidade}/{endereco.uf}
            {endereco.referencia && ` · ${endereco.referencia}`}
          </p>
        </div>

        {!confirmando && (
          <div className="flex items-center gap-1">
            {!endereco.principal && (
              <button
                type="button"
                onClick={onTornarPrincipal}
                disabled={ocupado || bloqueado}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <Star className="h-3.5 w-3.5" />
                Tornar principal
              </button>
            )}
            <button
              type="button"
              onClick={onEditar}
              disabled={ocupado || bloqueado}
              aria-label={`Editar ${resumo}`}
              title="Editar"
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onPedirExclusao}
              disabled={ocupado || bloqueado}
              aria-label={`Excluir ${resumo}`}
              title="Excluir"
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:text-slate-500 dark:hover:bg-red-950/40 dark:hover:text-red-400"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {confirmando && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950/30 dark:text-red-300"
        >
          <span>
            Excluir o endereço <strong>{resumo}</strong>?
            {endereco.principal &&
              " O endereço mais recente passa a ser o principal."}{" "}
            Pedidos já feitos não mudam.
          </span>
          <span className="flex gap-2">
            <Button variant="secondary" onClick={onCancelarExclusao}>
              Manter
            </Button>
            <Button variant="danger" onClick={onExcluir} isLoading={ocupado}>
              Excluir endereço
            </Button>
          </span>
        </div>
      )}
    </li>
  );
}

interface EditorEnderecoProps {
  inicial: CamposEndereco;
  salvando: boolean;
  onCancelar: () => void;
  onSalvar: (endereco: EnderecoNovoPayload) => void;
}

function EditorEndereco({
  inicial,
  salvando,
  onCancelar,
  onSalvar,
}: EditorEnderecoProps) {
  const endereco = useEnderecoForm(inicial);
  const [tentou, setTentou] = useState(false);

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-orange-200 bg-orange-50/40 p-4 dark:border-orange-900/50 dark:bg-orange-950/10">
      <EnderecoForm endereco={endereco} />

      {tentou && endereco.endereco === null && (
        <p role="status" className="text-sm text-amber-700 dark:text-amber-400">
          Preencha CEP, logradouro, número, bairro, cidade e UF.
        </p>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancelar} disabled={salvando}>
          Cancelar
        </Button>
        <Button
          isLoading={salvando}
          data-testid="botao-salvar-endereco"
          onClick={() => {
            setTentou(true);
            if (endereco.endereco !== null) {
              onSalvar(endereco.endereco);
            }
          }}
        >
          Salvar endereço
        </Button>
      </div>
    </div>
  );
}
