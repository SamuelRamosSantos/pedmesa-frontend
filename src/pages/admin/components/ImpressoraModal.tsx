import { Network } from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Input } from "../../../components/ui/Input";
import { Modal } from "../../../components/ui/Modal";
import { RodapeEdicao } from "../../../components/ui/RodapeEdicao";
import { Switch } from "../../../components/ui/Switch";
import { useToast } from "../../../contexts/ToastContext";
import { getApiErrorMessage } from "../../../lib/api-error";
import {
  createImpressora,
  deleteImpressora,
  updateImpressora,
} from "../../../services/impressora.service";
import type { Impressora } from "../../../types/impressora";

const IP_REGEX = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;

function isValidIp(ip: string): boolean {
  return (
    IP_REGEX.test(ip) && ip.split(".").every((octeto) => Number(octeto) <= 255)
  );
}

interface ImpressoraModalProps {
  isOpen: boolean;
  impressoraEditando: Impressora | null;
  onClose: () => void;
  onSaved: () => void;
  onDeleted?: (impressoraId: string) => void;
}

export function ImpressoraModal({
  isOpen,
  impressoraEditando,
  onClose,
  onSaved,
  onDeleted,
}: ImpressoraModalProps) {
  const [nome, setNome] = useState("");
  const [ip, setIp] = useState("");
  const [porta, setPorta] = useState("9100");
  const [ativo, setAtivo] = useState(true);

  const [nomeError, setNomeError] = useState<string | undefined>();
  const [ipError, setIpError] = useState<string | undefined>();
  const [portaError, setPortaError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { showToast } = useToast();
  const isEdicao = impressoraEditando !== null;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (impressoraEditando) {
      setNome(impressoraEditando.nome);
      setIp(impressoraEditando.ip);
      setPorta(String(impressoraEditando.porta));
      setAtivo(impressoraEditando.ativo);
    } else {
      setNome("");
      setIp("");
      setPorta("9100");
      setAtivo(true);
    }

    setNomeError(undefined);
    setIpError(undefined);
    setPortaError(undefined);
    setIsSubmitting(false);
    setIsDeleting(false);
  }, [isOpen, impressoraEditando]);

  async function handleExcluir() {
    if (!impressoraEditando || !onDeleted) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteImpressora(impressoraEditando.id);
      showToast(`Impressora "${impressoraEditando.nome}" excluída.`, "success");
      onDeleted(impressoraEditando.id);
    } catch (error) {
      showToast(
        getApiErrorMessage(error, "Não foi possível excluir a impressora."),
        "error",
      );
      setIsDeleting(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNomeError(undefined);
    setIpError(undefined);
    setPortaError(undefined);

    const portaNumero = Number(porta);
    let hasError = false;

    if (!nome.trim()) {
      setNomeError("Informe um nome para identificar a impressora.");
      hasError = true;
    }

    if (!isValidIp(ip.trim())) {
      setIpError("Informe um endereço IPv4 válido (ex.: 192.168.0.100).");
      hasError = true;
    }

    if (
      !porta ||
      !Number.isInteger(portaNumero) ||
      portaNumero < 1 ||
      portaNumero > 65535
    ) {
      setPortaError("Informe uma porta válida entre 1 e 65535.");
      hasError = true;
    }

    if (hasError) {
      return;
    }

    setIsSubmitting(true);

    const payload = { nome: nome.trim(), ip: ip.trim(), porta: portaNumero };

    try {
      if (impressoraEditando) {
        await updateImpressora(impressoraEditando.id, {
          ...payload,
          ativo,
        });
        showToast(
          `Impressora "${payload.nome}" atualizada com sucesso.`,
          "success",
        );
      } else {
        await createImpressora(payload);
        showToast(
          `Impressora "${payload.nome}" cadastrada com sucesso.`,
          "success",
        );
      }

      onSaved();
    } catch (error) {
      showToast(
        getApiErrorMessage(
          error,
          "Não foi possível salvar a impressora. Tente novamente.",
        ),
        "error",
      );
      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdicao ? "Editar impressora" : "Nova impressora"}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Input
          label="Nome"
          placeholder="Ex.: Cozinha, Bar"
          value={nome}
          onChange={(event) => setNome(event.target.value)}
          error={nomeError}
          autoFocus
        />

        <Input
          label="Endereço IP"
          placeholder="Ex.: 192.168.0.100"
          icon={<Network className="h-4 w-4" />}
          value={ip}
          onChange={(event) => setIp(event.target.value)}
          error={ipError}
        />

        <Input
          label="Porta"
          type="number"
          inputMode="numeric"
          min={1}
          max={65535}
          placeholder="9100"
          value={porta}
          onChange={(event) => setPorta(event.target.value)}
          error={portaError}
        />

        {isEdicao && (
          <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
            <Switch
              checked={ativo}
              onChange={setAtivo}
              label="Impressora ativa"
              description="Impressoras inativas não recebem trabalhos de impressão."
            />
          </div>
        )}

        <RodapeEdicao
          onCancelar={onClose}
          salvando={isSubmitting}
          excluir={
            impressoraEditando && onDeleted
              ? {
                  confirmacao: (
                    <span>
                      Excluir a impressora{" "}
                      <strong>{impressoraEditando.nome}</strong>? Esta ação não
                      pode ser desfeita.
                    </span>
                  ),
                  excluindo: isDeleting,
                  onConfirmar: () => void handleExcluir(),
                }
              : undefined
          }
        />
      </form>
    </Modal>
  );
}
