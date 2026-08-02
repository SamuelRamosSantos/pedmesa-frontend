import { useState } from "react";
import type { FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Modal } from "../../../components/ui/Modal";
import { useToast } from "../../../contexts/ToastContext";
import { getApiErrorMessage } from "../../../lib/api-error";
import { addIntegrante } from "../../../services/comanda.service";
import type { Integrante } from "../../../types/comanda";

interface AddIntegranteModalProps {
  isOpen: boolean;
  comandaId: string;
  onClose: () => void;
  onAdded: (integrante: Integrante) => void;
}

export function AddIntegranteModal({ isOpen, comandaId, onClose, onAdded }: AddIntegranteModalProps) {
  const [nome, setNome] = useState("");
  const [nomeError, setNomeError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  function handleClose() {
    setNome("");
    setNomeError(undefined);
    setIsSubmitting(false);
    onClose();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNomeError(undefined);

    if (!nome.trim()) {
      setNomeError("Informe o nome do integrante.");
      return;
    }

    setIsSubmitting(true);

    try {
      const integrante = await addIntegrante(comandaId, nome.trim());
      showToast(`${integrante.nome} adicionado(a) à comanda.`, "success");
      handleClose();
      onAdded(integrante);
    } catch (error) {
      showToast(getApiErrorMessage(error, "Não foi possível adicionar o integrante."), "error");
      setIsSubmitting(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Adicionar integrante">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Input
          label="Nome"
          placeholder="Ex.: Lucas"
          value={nome}
          onChange={(event) => setNome(event.target.value)}
          error={nomeError}
          autoFocus
        />
        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={handleClose} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting} className="flex-1">
            Adicionar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
