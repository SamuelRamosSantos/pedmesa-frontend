import { Ban, Printer, Undo2 } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import {
  AVANCAR,
  aguardandoCozinha,
  podeCancelar,
  VOLTAR,
} from "../../../lib/expedicao";
import { CLASSES_DO_TOM } from "../../../lib/tons";
import type { EntregaPainel } from "../../../types/delivery";

export interface HandlersAcoesEntrega {
  onAvancar: (entrega: EntregaPainel) => void;
  onVoltar: (entrega: EntregaPainel) => void;
  onCancelar: (entrega: EntregaPainel) => void;
  onReimprimir: (entrega: EntregaPainel) => void;
}

interface AcoesEntregaProps extends HandlersAcoesEntrega {
  entrega: EntregaPainel;
  ocupada: boolean;
  // "modal" diferencia os data-testid do mesmo pedido aberto no modal (PED-130).
  contexto?: "card" | "modal";
}

// Ações de status de uma entrega (PED-110/PED-127): as mesmas no card do painel e no
// modal de detalhes (PED-130), para as regras ficarem num lugar só.
export function AcoesEntrega({
  entrega,
  ocupada,
  contexto = "card",
  onAvancar,
  onVoltar,
  onCancelar,
  onReimprimir,
}: AcoesEntregaProps) {
  const avancar = AVANCAR[entrega.status_entrega];
  const voltar = VOLTAR[entrega.status_entrega];
  const esperandoCozinha = aguardandoCozinha(entrega);
  const prefixo = contexto === "modal" ? "modal-" : "";

  return (
    <div className="flex flex-col gap-3">
      {entrega.status_entrega !== "entregue" && (avancar || voltar) && (
        <div className="flex flex-wrap items-center gap-2">
          {voltar && (
            <Button
              variant="secondary"
              onClick={() => onVoltar(entrega)}
              disabled={ocupada}
              aria-label={voltar.label}
              title={voltar.label}
              className="shrink-0 px-3"
            >
              <Undo2 className="h-4 w-4" />
            </Button>
          )}
          {avancar && (
            <Button
              onClick={() => onAvancar(entrega)}
              isLoading={ocupada}
              disabled={esperandoCozinha}
              title={
                esperandoCozinha
                  ? "Aguardando a cozinha terminar o preparo"
                  : undefined
              }
              data-testid={`${prefixo}avancar-entrega-${entrega.numero_entrega}`}
              className="flex-1"
            >
              {esperandoCozinha ? "Aguardando a cozinha" : avancar.label}
            </Button>
          )}
        </div>
      )}

      {entrega.status_entrega === "entregue" && voltar && (
        <Button
          variant="secondary"
          onClick={() => onVoltar(entrega)}
          disabled={ocupada}
          data-testid={`${prefixo}desfazer-entrega-${entrega.numero_entrega}`}
          className="w-full"
        >
          <Undo2 className="h-4 w-4" />
          {voltar.label}
        </Button>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {entrega.status_entrega !== "cancelado" && (
          <Button
            variant="ghost"
            onClick={() => onReimprimir(entrega)}
            className="whitespace-nowrap px-2.5 py-1.5 text-legenda"
          >
            <Printer className="h-3.5 w-3.5" />
            Reimprimir ticket
          </Button>
        )}
        {podeCancelar(entrega.status_entrega) && (
          <Button
            variant="ghost"
            onClick={() => onCancelar(entrega)}
            disabled={ocupada}
            className={`ml-auto px-2.5 py-1.5 text-legenda ${CLASSES_DO_TOM.perigo.texto}`}
          >
            <Ban className="h-3.5 w-3.5" />
            Cancelar
          </Button>
        )}
      </div>
    </div>
  );
}
