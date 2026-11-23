import { Merge } from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Button } from "../../../components/ui/Button";
import { Modal } from "../../../components/ui/Modal";
import { Select } from "../../../components/ui/Select";
import { useToast } from "../../../contexts/ToastContext";
import { getApiErrorMessage } from "../../../lib/api-error";
import { CLASSES_DO_TOM } from "../../../lib/tons";
import { joinComandas } from "../../../services/comanda.service";
import type { ComandaListItem } from "../../../types/comanda";

interface JuntarComandasModalProps {
  isOpen: boolean;
  comandas: ComandaListItem[];
  onClose: () => void;
  onJoined: () => void;
}

export function JuntarComandasModal({
  isOpen,
  comandas,
  onClose,
  onJoined,
}: JuntarComandasModalProps) {
  const [principalId, setPrincipalId] = useState("");
  const [secundariasIds, setSecundariasIds] = useState<string[]>([]);
  const [errorPrincipal, setErrorPrincipal] = useState<string | undefined>();
  const [errorSecundarias, setErrorSecundarias] = useState<
    string | undefined
  >();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (!isOpen) {
      setPrincipalId("");
      setSecundariasIds([]);
      setErrorPrincipal(undefined);
      setErrorSecundarias(undefined);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  function handlePrincipalChange(value: string) {
    setPrincipalId(value);
    setSecundariasIds((current) => current.filter((id) => id !== value));
  }

  function handleToggleSecundaria(id: string) {
    setSecundariasIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorPrincipal(undefined);
    setErrorSecundarias(undefined);

    if (!principalId) {
      setErrorPrincipal("Selecione a comanda principal.");
      return;
    }

    if (secundariasIds.length === 0) {
      setErrorSecundarias("Selecione ao menos uma comanda secundária.");
      return;
    }

    setIsSubmitting(true);

    try {
      const resultado = await joinComandas({
        comanda_principal_id: principalId,
        comandas_secundarias_ids: secundariasIds,
      });

      showToast(resultado.mensagem, "success");
      onJoined();
    } catch (error) {
      showToast(
        getApiErrorMessage(error, "Não foi possível juntar as comandas."),
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const secundariasDisponiveis = comandas.filter(
    (comanda) => comanda.id !== principalId,
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Juntar comandas">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Select
          id="comanda-principal"
          label="Comanda principal"
          value={principalId}
          onChange={(event) => handlePrincipalChange(event.target.value)}
          error={errorPrincipal}
        >
          <option value="">Selecione a mesa que vai receber os itens...</option>
          {comandas.map((comanda) => (
            <option key={comanda.id} value={comanda.id}>
              Mesa {comanda.numero_comanda} ({comanda.total_integrantes}{" "}
              pessoas)
            </option>
          ))}
        </Select>

        <div className="flex flex-col gap-1.5">
          <span className="text-corpo font-medium text-slate-700 dark:text-slate-300">
            Comandas secundárias
          </span>
          <p className="text-legenda text-slate-500 dark:text-slate-400">
            Serão fechadas e seus integrantes movidos para a comanda principal.
          </p>

          <div className="flex max-h-48 flex-col gap-1 overflow-y-auto rounded-lg border border-slate-200 p-2 dark:border-slate-700">
            {secundariasDisponiveis.map((comanda) => (
              <label
                key={comanda.id}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-corpo text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <input
                  type="checkbox"
                  checked={secundariasIds.includes(comanda.id)}
                  onChange={() => handleToggleSecundaria(comanda.id)}
                  className="h-4 w-4 rounded border-slate-300 accent-marca-600 dark:border-slate-600 dark:bg-slate-800"
                />
                Mesa {comanda.numero_comanda} ({comanda.total_integrantes}{" "}
                pessoas)
              </label>
            ))}
          </div>
          {errorSecundarias && (
            <p className={`text-legenda ${CLASSES_DO_TOM.perigo.texto}`}>
              {errorSecundarias}
            </p>
          )}
        </div>

        <div className="mt-2 flex gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting} className="flex-1">
            <Merge className="h-4 w-4" />
            Juntar Comandas
          </Button>
        </div>
      </form>
    </Modal>
  );
}
