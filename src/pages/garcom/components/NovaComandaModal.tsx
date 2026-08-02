import { Plus, Trash2, UserPlus } from "lucide-react";
import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Modal } from "../../../components/ui/Modal";
import { useToast } from "../../../contexts/ToastContext";
import { getApiErrorMessage } from "../../../lib/api-error";
import { createComanda } from "../../../services/comanda.service";

interface IntegranteField {
  id: number;
  nome: string;
}

interface NovaComandaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

function criarCampoVazio(id: number): IntegranteField {
  return { id, nome: "" };
}

export function NovaComandaModal({ isOpen, onClose, onCreated }: NovaComandaModalProps) {
  const [numeroComanda, setNumeroComanda] = useState("");
  const [integrantes, setIntegrantes] = useState<IntegranteField[]>([criarCampoVazio(0)]);
  const [numeroError, setNumeroError] = useState<string | undefined>();
  const [integrantesError, setIntegrantesError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nextFieldIdRef = useRef(1);
  const { showToast } = useToast();

  function resetForm() {
    setNumeroComanda("");
    setIntegrantes([criarCampoVazio(0)]);
    nextFieldIdRef.current = 1;
    setNumeroError(undefined);
    setIntegrantesError(undefined);
    setIsSubmitting(false);
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function handleIntegranteChange(id: number, nome: string) {
    setIntegrantes((current) => current.map((field) => (field.id === id ? { ...field, nome } : field)));
  }

  function handleAddIntegrante() {
    setIntegrantes((current) => [...current, criarCampoVazio(nextFieldIdRef.current++)]);
  }

  function handleRemoveIntegrante(id: number) {
    setIntegrantes((current) => current.filter((field) => field.id !== id));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNumeroError(undefined);
    setIntegrantesError(undefined);

    const numero = Number(numeroComanda);

    if (!numeroComanda || !Number.isInteger(numero) || numero <= 0) {
      setNumeroError("Informe um número de comanda válido.");
      return;
    }

    const nomesValidos = integrantes.map((field) => field.nome.trim()).filter((nome) => nome.length > 0);

    if (nomesValidos.length === 0) {
      setIntegrantesError("Informe ao menos um integrante.");
      return;
    }

    setIsSubmitting(true);

    try {
      const comanda = await createComanda({
        numero_comanda: numero,
        integrantes: nomesValidos.map((nome) => ({ nome })),
      });

      showToast(`Comanda ${comanda.numero_comanda} aberta com sucesso!`, "success");
      resetForm();
      onCreated();
    } catch (error) {
      showToast(getApiErrorMessage(error, "Não foi possível abrir a comanda. Tente novamente."), "error");
      setIsSubmitting(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Abrir comanda">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Input
          label="Número da comanda"
          type="number"
          inputMode="numeric"
          min={1}
          step={1}
          placeholder="Ex: 12"
          value={numeroComanda}
          onChange={(event) => setNumeroComanda(event.target.value)}
          error={numeroError}
          autoFocus
        />

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700">Integrantes</span>

          <div className="flex flex-col gap-2">
            {integrantes.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <input
                  type="text"
                  aria-label={`Nome do integrante ${index + 1}`}
                  placeholder={`Integrante ${index + 1} (ex.: Lucas)`}
                  value={field.nome}
                  onChange={(event) => handleIntegranteChange(field.id, event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                />
                {integrantes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveIntegrante(field.id)}
                    className="shrink-0 rounded-lg p-2.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    aria-label={`Remover integrante ${index + 1}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {integrantesError && <p className="text-sm text-red-600">{integrantesError}</p>}

          <button
            type="button"
            onClick={handleAddIntegrante}
            className="flex items-center gap-1.5 self-start rounded-lg px-2 py-1.5 text-sm font-medium text-orange-600 hover:bg-orange-50"
          >
            <UserPlus className="h-4 w-4" />
            Adicionar integrante
          </button>
        </div>

        <div className="mt-2 flex gap-3">
          <Button type="button" variant="secondary" onClick={handleClose} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting} className="flex-1">
            <Plus className="h-4 w-4" />
            Abrir comanda
          </Button>
        </div>
      </form>
    </Modal>
  );
}
