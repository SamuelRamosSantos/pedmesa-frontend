import { useId, useState } from "react";
import { Button } from "../../../components/ui/Button";
import { Modal } from "../../../components/ui/Modal";
import { MOTIVO_MINIMO_CARACTERES, motivoValido } from "../../../lib/expedicao";

interface MotivoModalProps {
  titulo: string;
  descricao: string;
  rotuloConfirmar: string;
  perigo: boolean;
  enviando: boolean;
  onConfirmar: (motivo: string) => void;
  onFechar: () => void;
}

// Motivo obrigatório para cancelar ou devolver uma entrega que estava em rota (mesmo
// mínimo do backend). Montado só quando aberto: cada abertura começa vazia.
export function MotivoModal({ titulo, descricao, rotuloConfirmar, perigo, enviando, onConfirmar, onFechar }: MotivoModalProps) {
  const [motivo, setMotivo] = useState("");
  const campoId = useId();
  const valido = motivoValido(motivo);

  return (
    <Modal isOpen onClose={onFechar} title={titulo}>
      <form
        className="flex flex-col gap-4"
        onSubmit={(evento) => {
          evento.preventDefault();
          if (valido) {
            onConfirmar(motivo.trim());
          }
        }}
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">{descricao}</p>
        <div className="flex flex-col gap-1.5">
          <label htmlFor={campoId} className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Motivo
          </label>
          <textarea
            id={campoId}
            autoFocus
            rows={3}
            maxLength={255}
            value={motivo}
            onChange={(evento) => setMotivo(evento.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">Mínimo de {MOTIVO_MINIMO_CARACTERES} caracteres.</p>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onFechar}>
            Voltar
          </Button>
          <Button type="submit" variant={perigo ? "danger" : "primary"} disabled={!valido} isLoading={enviando}>
            {rotuloConfirmar}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
