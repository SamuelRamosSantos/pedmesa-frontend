import { Save } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { CurrencyInput } from "../../../components/ui/CurrencyInput";
import { Input } from "../../../components/ui/Input";
import { Modal } from "../../../components/ui/Modal";
import { useToast } from "../../../contexts/ToastContext";
import { getApiErrorMessage, getApiErrorStatus } from "../../../lib/api-error";
import { formDaTaxa, validarFormTaxa, type CampoFormTaxa, type FormTaxa } from "../../../lib/taxas-entrega";
import { createTaxaEntrega, updateTaxaEntrega } from "../../../services/delivery.service";
import type { TaxaEntrega } from "../../../types/delivery";

interface TaxaEntregaModalProps {
  // null = nova taxa.
  taxa: TaxaEntrega | null;
  cidadePadrao: string;
  onClose: () => void;
  onSaved: (taxa: TaxaEntrega) => void;
}

// Criar/editar a taxa de um bairro (PED-111). Montado só quando aberto: cada abertura
// começa do valor salvo. Bairro duplicado (409) aparece no próprio campo.
export function TaxaEntregaModal({ taxa, cidadePadrao, onClose, onSaved }: TaxaEntregaModalProps) {
  const { showToast } = useToast();
  const [form, setForm] = useState<FormTaxa>(() => formDaTaxa(taxa, cidadePadrao));
  const [erros, setErros] = useState<Partial<Record<CampoFormTaxa, string>>>({});
  const [salvando, setSalvando] = useState(false);

  const alterar = (alteracao: Partial<FormTaxa>) => setForm((atual) => ({ ...atual, ...alteracao }));

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const resultado = validarFormTaxa(form);

    if (!resultado.ok) {
      setErros(resultado.erros);
      return;
    }

    setErros({});
    setSalvando(true);

    try {
      const salva = taxa === null ? await createTaxaEntrega(resultado.payload) : await updateTaxaEntrega(taxa.id, resultado.payload);
      showToast(`Taxa de ${salva.bairro} salva.`, "success");
      onSaved(salva);
    } catch (error) {
      if (getApiErrorStatus(error) === 409) {
        setErros({ bairro: getApiErrorMessage(error, "Já existe uma taxa para este bairro.") });
      } else {
        showToast(getApiErrorMessage(error, "Não foi possível salvar a taxa."), "error");
      }
      setSalvando(false);
    }
  }

  return (
    <Modal isOpen onClose={onClose} title={taxa === null ? "Nova taxa de entrega" : `Editar taxa de ${taxa.bairro}`}>
      <form onSubmit={salvar} className="flex flex-col gap-4" noValidate>
        <Input
          label="Bairro"
          autoFocus
          placeholder="Ex.: Bela Vista"
          value={form.bairro}
          onChange={(evento) => alterar({ bairro: evento.target.value })}
          error={erros.bairro}
        />
        <Input label="Cidade" value={form.cidade} onChange={(evento) => alterar({ cidade: evento.target.value })} error={erros.cidade} />
        <CurrencyInput label="Taxa de entrega" valueCents={form.valorCents} onChangeCents={(valorCents) => alterar({ valorCents })} />
        <Input
          label="Tempo estimado em minutos (opcional)"
          type="number"
          inputMode="numeric"
          min={1}
          placeholder="Ex.: 40"
          value={form.tempoEstimado}
          onChange={(evento) => alterar({ tempoEstimado: evento.target.value })}
          error={erros.tempoEstimado}
        />

        <div className="mt-2 flex gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" isLoading={salvando} className="flex-1">
            <Save className="h-4 w-4" />
            Salvar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
