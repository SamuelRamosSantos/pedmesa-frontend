import { Merge } from "lucide-react";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { Modal } from "../../../components/ui/Modal";
import { useToast } from "../../../contexts/ToastContext";
import { getApiErrorMessage } from "../../../lib/api-error";
import { joinComandas } from "../../../services/comanda.service";
import type { ComandaListItem } from "../../../types/comanda";

interface JuntarComandasModalProps {
  isOpen: boolean;
  comandas: ComandaListItem[];
  onClose: () => void;
  onJoined: () => void;
}

export function JuntarComandasModal({ isOpen, comandas, onClose, onJoined }: JuntarComandasModalProps) {
  const [principalId, setPrincipalId] = useState("");
  const [secundariasIds, setSecundariasIds] = useState<string[]>([]);
  const [errorPrincipal, setErrorPrincipal] = useState<string | undefined>();
  const [errorSecundarias, setErrorSecundarias] = useState<string | undefined>();
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
    setSecundariasIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
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
      showToast(getApiErrorMessage(error, "Não foi possível juntar as comandas."), "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  const secundariasDisponiveis = comandas.filter((comanda) => comanda.id !== principalId);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Juntar comandas">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="comanda-principal" className="text-sm font-medium text-slate-700">
            Comanda principal
          </label>
          <select
            id="comanda-principal"
            value={principalId}
            onChange={(event) => handlePrincipalChange(event.target.value)}
            className={`rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 ${
              errorPrincipal
                ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                : "border-slate-300 focus:border-orange-500 focus:ring-orange-500/20"
            }`}
          >
            <option value="">Selecione a mesa que vai receber os itens...</option>
            {comandas.map((comanda) => (
              <option key={comanda.id} value={comanda.id}>
                Mesa {comanda.numero_comanda} ({comanda.total_integrantes} pessoas)
              </option>
            ))}
          </select>
          {errorPrincipal && <p className="text-sm text-red-600">{errorPrincipal}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-slate-700">Comandas secundárias</span>
          <p className="text-xs text-slate-500">
            Serão fechadas e seus integrantes movidos para a comanda principal.
          </p>

          <div className="flex max-h-48 flex-col gap-1 overflow-y-auto rounded-lg border border-slate-200 p-2">
            {secundariasDisponiveis.map((comanda) => (
              <label
                key={comanda.id}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  checked={secundariasIds.includes(comanda.id)}
                  onChange={() => handleToggleSecundaria(comanda.id)}
                  className="h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500/40"
                />
                Mesa {comanda.numero_comanda} ({comanda.total_integrantes} pessoas)
              </label>
            ))}
          </div>
          {errorSecundarias && <p className="text-sm text-red-600">{errorSecundarias}</p>}
        </div>

        <div className="mt-2 flex gap-3">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
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
