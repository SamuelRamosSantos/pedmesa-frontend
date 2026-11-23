import { useEffect, useRef, useState } from "react";
import { Button } from "../../../components/ui/Button";
import { Modal } from "../../../components/ui/Modal";
import { Textarea } from "../../../components/ui/Textarea";
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
export function MotivoModal({
  titulo,
  descricao,
  rotuloConfirmar,
  perigo,
  enviando,
  onConfirmar,
  onFechar,
}: MotivoModalProps) {
  const [motivo, setMotivo] = useState("");
  const campoRef = useRef<HTMLTextAreaElement>(null);
  const valido = motivoValido(motivo);

  // Montado só quando aberto: o foco vai direto para o motivo.
  useEffect(() => {
    campoRef.current?.focus();
  }, []);

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
        <p className="text-corpo text-slate-600 dark:text-slate-300">
          {descricao}
        </p>
        <div className="flex flex-col gap-1.5">
          <Textarea
            ref={campoRef}
            label="Motivo"
            rows={3}
            maxLength={255}
            value={motivo}
            onChange={(evento) => setMotivo(evento.target.value)}
          />
          <p className="text-legenda text-slate-500 dark:text-slate-400">
            Mínimo de {MOTIVO_MINIMO_CARACTERES} caracteres.
          </p>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onFechar}>
            Voltar
          </Button>
          <Button
            type="submit"
            variant={perigo ? "danger" : "primary"}
            disabled={!valido}
            isLoading={enviando}
          >
            {rotuloConfirmar}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
