import { Network, Save } from "lucide-react";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Modal } from "../../../components/ui/Modal";
import { useToast } from "../../../contexts/ToastContext";
import { getApiErrorMessage } from "../../../lib/api-error";
import { createImpressora, updateImpressora } from "../../../services/impressora.service";
import type { Impressora } from "../../../types/impressora";

const IP_REGEX = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;

function isValidIp(ip: string): boolean {
  return IP_REGEX.test(ip) && ip.split(".").every((octeto) => Number(octeto) <= 255);
}

interface ImpressoraModalProps {
  isOpen: boolean;
  impressoraEditando: Impressora | null;
  onClose: () => void;
  onSaved: () => void;
}

export function ImpressoraModal({ isOpen, impressoraEditando, onClose, onSaved }: ImpressoraModalProps) {
  const [nome, setNome] = useState("");
  const [ip, setIp] = useState("");
  const [porta, setPorta] = useState("9100");

  const [nomeError, setNomeError] = useState<string | undefined>();
  const [ipError, setIpError] = useState<string | undefined>();
  const [portaError, setPortaError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    } else {
      setNome("");
      setIp("");
      setPorta("9100");
    }

    setNomeError(undefined);
    setIpError(undefined);
    setPortaError(undefined);
    setIsSubmitting(false);
  }, [isOpen, impressoraEditando]);

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

    if (!porta || !Number.isInteger(portaNumero) || portaNumero < 1 || portaNumero > 65535) {
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
        await updateImpressora(impressoraEditando.id, payload);
        showToast(`Impressora "${payload.nome}" atualizada com sucesso.`, "success");
      } else {
        await createImpressora(payload);
        showToast(`Impressora "${payload.nome}" cadastrada com sucesso.`, "success");
      }

      onSaved();
    } catch (error) {
      showToast(getApiErrorMessage(error, "Não foi possível salvar a impressora. Tente novamente."), "error");
      setIsSubmitting(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdicao ? "Editar impressora" : "Nova impressora"}>
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

        <div className="mt-2 flex gap-3">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting} className="flex-1">
            <Save className="h-4 w-4" />
            Salvar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
