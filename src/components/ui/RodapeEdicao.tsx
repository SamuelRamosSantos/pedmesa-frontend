import { Save, Trash2 } from "lucide-react";
import { type ReactNode, useState } from "react";
import { CLASSES_DO_TOM } from "../../lib/tons";
import { Button } from "./Button";

export interface AcaoExcluirEdicao {
  rotulo?: string;
  // Mensagem da confirmação nomeando o item (ex.: 'Excluir o produto "X-Salada"?').
  confirmacao: ReactNode;
  rotuloConfirmar?: string;
  excluindo?: boolean;
  desabilitado?: boolean;
  onConfirmar: () => void;
}

interface RodapeEdicaoProps {
  onCancelar: () => void;
  salvando?: boolean;
  desabilitado?: boolean;
  rotuloSalvar?: string;
  iconeSalvar?: ReactNode;
  // Quando omitido, o botão de salvar é type="submit" do formulário pai.
  onSalvar?: () => void;
  excluir?: AcaoExcluirEdicao;
}

// Rodapé único para modais e editores de cadastro (PED-135): concentra Cancelar, Salvar e
// a exclusão com confirmação inline (evitando empilhar um segundo modal sobre o aberto).
export function RodapeEdicao({
  onCancelar,
  salvando = false,
  desabilitado = false,
  rotuloSalvar = "Salvar",
  iconeSalvar,
  onSalvar,
  excluir,
}: RodapeEdicaoProps) {
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const ocupado = salvando || Boolean(excluir?.excluindo);

  if (excluir && confirmandoExclusao) {
    return (
      <div
        role="alert"
        className={`mt-2 flex flex-col gap-3 rounded-lg border p-3 text-corpo ${CLASSES_DO_TOM.perigo.superficie}`}
      >
        <div>{excluir.confirmacao}</div>
        <div className="flex justify-end gap-2">
          <Button
            variant="secondary"
            onClick={() => setConfirmandoExclusao(false)}
            disabled={ocupado}
          >
            Manter
          </Button>
          <Button
            variant="danger"
            onClick={excluir.onConfirmar}
            isLoading={excluir.excluindo}
            data-testid="confirmar-exclusao-edicao"
          >
            {excluir.rotuloConfirmar ?? "Sim, excluir"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
      {excluir ? (
        <Button
          variant="ghost"
          onClick={() => setConfirmandoExclusao(true)}
          disabled={ocupado || desabilitado || excluir.desabilitado}
          data-testid="pedir-exclusao-edicao"
          className={`${CLASSES_DO_TOM.perigo.texto} hover:bg-red-50 dark:hover:bg-red-950/30`}
        >
          <Trash2 className="h-4 w-4" />
          {excluir.rotulo ?? "Excluir"}
        </Button>
      ) : null}

      <div className={`flex gap-3 ${excluir ? "ml-auto" : "w-full"}`}>
        <Button
          variant="secondary"
          onClick={onCancelar}
          disabled={ocupado}
          className={excluir ? "" : "flex-1"}
        >
          Cancelar
        </Button>
        <Button
          type={onSalvar ? "button" : "submit"}
          onClick={onSalvar}
          isLoading={salvando}
          disabled={desabilitado || Boolean(excluir?.excluindo)}
          className={excluir ? "" : "flex-1"}
        >
          {iconeSalvar ?? <Save className="h-4 w-4" />}
          {rotuloSalvar}
        </Button>
      </div>
    </div>
  );
}
