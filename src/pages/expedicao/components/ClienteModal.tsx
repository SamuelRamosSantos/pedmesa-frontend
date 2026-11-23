import { Phone, Save } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Modal } from "../../../components/ui/Modal";
import { Textarea } from "../../../components/ui/Textarea";
import { useToast } from "../../../contexts/ToastContext";
import { getApiErrorMessage, getApiErrorStatus } from "../../../lib/api-error";
import {
  type CampoFormCliente,
  type FormCliente,
  formDoCliente,
  OBSERVACOES_CLIENTE_MAX,
  validarFormCliente,
} from "../../../lib/cadastro-cliente";
import { mascararTelefone } from "../../../lib/mascaras";
import {
  createCliente,
  updateCliente,
} from "../../../services/cliente.service";
import type { Cliente } from "../../../types/cliente";
import { EnderecosCliente } from "./EnderecosCliente";

interface ClienteModalProps {
  // null = cliente novo.
  cliente: Cliente | null;
  onClose: () => void;
  // Chamado a cada alteração salva (dados ou endereços), para a lista refletir.
  onSalvo: (cliente: Cliente) => void;
}

// Cadastro e edição de um cliente do delivery (PED-124, PED-137): nome, telefone,
// observações e endereços. Montado só quando aberto: cada abertura começa do que está
// salvo. Depois de cadastrar, o modal continua aberto para incluir os endereços.
export function ClienteModal({ cliente, onClose, onSalvo }: ClienteModalProps) {
  const { showToast } = useToast();
  const [atual, setAtual] = useState<Cliente | null>(cliente);
  const [form, setForm] = useState<FormCliente>(() => formDoCliente(cliente));
  const [erros, setErros] = useState<Partial<Record<CampoFormCliente, string>>>(
    {},
  );
  const [salvando, setSalvando] = useState(false);

  function alterar(campo: CampoFormCliente, valor: string) {
    setForm((anterior) => ({
      ...anterior,
      [campo]: campo === "telefone" ? mascararTelefone(valor) : valor,
    }));
    // O erro do campo some assim que ele é corrigido.
    setErros((anteriores) => ({ ...anteriores, [campo]: undefined }));
  }

  function aoAlterar(alterado: Cliente) {
    setAtual(alterado);
    onSalvo(alterado);
  }

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const resultado = validarFormCliente(form);

    if (!resultado.ok) {
      setErros(resultado.erros);
      return;
    }

    setSalvando(true);

    try {
      const salvo =
        atual === null
          ? await createCliente(resultado.payload)
          : await updateCliente(atual.id, resultado.payload);
      aoAlterar(salvo);
      setForm(formDoCliente(salvo));
      showToast(
        atual === null
          ? `${salvo.nome} cadastrado. Agora você pode adicionar os endereços.`
          : `Dados de ${salvo.nome} salvos.`,
        "success",
      );
    } catch (error) {
      if (getApiErrorStatus(error) === 409) {
        setErros({
          telefone: getApiErrorMessage(
            error,
            "Já existe um cliente com este telefone.",
          ),
        });
      } else {
        showToast(
          getApiErrorMessage(error, "Não foi possível salvar o cliente."),
          "error",
        );
      }
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      tamanho="lg"
      title={atual === null ? "Novo cliente" : `Cliente: ${atual.nome}`}
    >
      <div className="flex flex-col gap-6">
        <form className="flex flex-col gap-4" onSubmit={salvar} noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Nome"
              autoComplete="off"
              value={form.nome}
              error={erros.nome}
              onChange={(evento) => alterar("nome", evento.target.value)}
              data-testid="cliente-nome"
            />
            <Input
              label="Telefone"
              type="tel"
              inputMode="tel"
              autoComplete="off"
              placeholder="(11) 98765-4321"
              icon={<Phone className="h-4 w-4" />}
              value={form.telefone}
              error={erros.telefone}
              onChange={(evento) => alterar("telefone", evento.target.value)}
              data-testid="cliente-telefone"
            />
          </div>

          <Textarea
            label="Observações (opcional)"
            rows={2}
            maxLength={OBSERVACOES_CLIENTE_MAX}
            placeholder="Ex.: interfone quebrado, ligar ao chegar"
            value={form.observacoes}
            error={erros.observacoes}
            onChange={(evento) => alterar("observacoes", evento.target.value)}
          />

          <div className="flex justify-end">
            <Button
              type="submit"
              isLoading={salvando}
              data-testid="botao-salvar-cliente"
            >
              <Save className="h-4 w-4" />
              {atual === null ? "Cadastrar cliente" : "Salvar dados"}
            </Button>
          </div>
        </form>

        {atual !== null && (
          <div className="border-t border-slate-200 pt-5 dark:border-slate-800">
            <EnderecosCliente cliente={atual} onAlterado={aoAlterar} />
          </div>
        )}

        <div className="flex justify-end border-t border-slate-200 pt-4 dark:border-slate-800">
          <Button variant="secondary" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
