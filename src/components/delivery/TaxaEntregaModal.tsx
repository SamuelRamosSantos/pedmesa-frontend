import { type FormEvent, useState } from "react";
import { useToast } from "../../contexts/ToastContext";
import { getApiErrorMessage, getApiErrorStatus } from "../../lib/api-error";
import {
  type CampoFormTaxa,
  type FormTaxa,
  formDaTaxa,
  validarFormTaxa,
} from "../../lib/taxas-entrega";
import {
  createTaxaEntrega,
  deleteTaxaEntrega,
  updateTaxaEntrega,
} from "../../services/delivery.service";
import type { TaxaEntrega } from "../../types/delivery";
import { CurrencyInput } from "../ui/CurrencyInput";
import { Input } from "../ui/Input";
import { Modal } from "../ui/Modal";
import { RodapeEdicao } from "../ui/RodapeEdicao";
import { Switch } from "../ui/Switch";

interface TaxaEntregaModalProps {
  // null = nova taxa.
  taxa: TaxaEntrega | null;
  cidadePadrao: string;
  // Bairro já preenchido na taxa nova (cadastro pelo novo pedido, PED-125).
  bairroPadrao?: string;
  onClose: () => void;
  onSaved: (taxa: TaxaEntrega) => void;
  onDeleted?: (taxaId: string) => void;
}

// Criar/editar a taxa de um bairro (PED-111; também pelo novo pedido delivery, PED-125).
// Montado só quando aberto: cada abertura começa do valor salvo. Bairro duplicado (409)
// aparece no próprio campo.
export function TaxaEntregaModal({
  taxa,
  cidadePadrao,
  bairroPadrao = "",
  onClose,
  onSaved,
  onDeleted,
}: TaxaEntregaModalProps) {
  const { showToast } = useToast();
  const [form, setForm] = useState<FormTaxa>(() =>
    formDaTaxa(taxa, cidadePadrao, bairroPadrao),
  );
  const [ativo, setAtivo] = useState(() => taxa?.ativo ?? true);
  const [erros, setErros] = useState<Partial<Record<CampoFormTaxa, string>>>(
    {},
  );
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  const alterar = (alteracao: Partial<FormTaxa>) =>
    setForm((atual) => ({ ...atual, ...alteracao }));

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
      const salva =
        taxa === null
          ? await createTaxaEntrega(resultado.payload)
          : await updateTaxaEntrega(taxa.id, {
              ...resultado.payload,
              ativo,
            });
      showToast(`Taxa de ${salva.bairro} salva.`, "success");
      onSaved(salva);
    } catch (error) {
      if (getApiErrorStatus(error) === 409) {
        setErros({
          bairro: getApiErrorMessage(
            error,
            "Já existe uma taxa para este bairro.",
          ),
        });
      } else {
        showToast(
          getApiErrorMessage(error, "Não foi possível salvar a taxa."),
          "error",
        );
      }
      setSalvando(false);
    }
  }

  async function excluirTaxa() {
    if (!taxa || !onDeleted) {
      return;
    }

    setExcluindo(true);

    try {
      await deleteTaxaEntrega(taxa.id);
      showToast(`Taxa de ${taxa.bairro} excluída.`, "success");
      onDeleted(taxa.id);
    } catch (error) {
      showToast(
        getApiErrorMessage(error, "Não foi possível excluir a taxa."),
        "error",
      );
      setExcluindo(false);
    }
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={
        taxa === null ? "Nova taxa de entrega" : `Editar taxa de ${taxa.bairro}`
      }
    >
      <form onSubmit={salvar} className="flex flex-col gap-4" noValidate>
        <Input
          label="Bairro"
          autoFocus
          placeholder="Ex.: Bela Vista"
          value={form.bairro}
          onChange={(evento) => alterar({ bairro: evento.target.value })}
          error={erros.bairro}
        />
        <Input
          label="Cidade"
          value={form.cidade}
          onChange={(evento) => alterar({ cidade: evento.target.value })}
          error={erros.cidade}
        />
        <CurrencyInput
          label="Taxa de entrega"
          valueCents={form.valorCents}
          onChangeCents={(valorCents) => alterar({ valorCents })}
        />
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

        {taxa !== null && (
          <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
            <Switch
              checked={ativo}
              onChange={setAtivo}
              label="Bairro atendido (ativo)"
              description="Quando desativado, o bairro deixa de ser aceito em novos pedidos."
            />
          </div>
        )}

        <RodapeEdicao
          onCancelar={onClose}
          salvando={salvando}
          excluir={
            taxa !== null && onDeleted
              ? {
                  confirmacao: (
                    <span>
                      Excluir a taxa de <strong>{taxa.bairro}</strong>? O bairro
                      deixa de ter taxa própria. Pedidos já registrados não
                      mudam.
                    </span>
                  ),
                  excluindo,
                  onConfirmar: () => void excluirTaxa(),
                }
              : undefined
          }
        />
      </form>
    </Modal>
  );
}
