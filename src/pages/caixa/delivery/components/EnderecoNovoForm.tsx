import { EnderecoForm } from "../../../../components/endereco/EnderecoForm";
import type { ControleEnderecoNovo } from "../useEnderecoNovo";

interface EnderecoNovoFormProps {
  endereco: ControleEnderecoNovo;
}

// Endereço novo do pedido delivery (PED-108): o formulário compartilhado e a opção de
// guardar o endereço no cadastro do cliente.
export function EnderecoNovoForm({ endereco }: EnderecoNovoFormProps) {
  return (
    <EnderecoForm endereco={endereco}>
      <label className="flex w-fit cursor-pointer items-center gap-2 text-corpo text-slate-700 dark:text-slate-300">
        <input
          type="checkbox"
          checked={endereco.salvarNoCadastro}
          onChange={(evento) =>
            endereco.alterarSalvarNoCadastro(evento.target.checked)
          }
          className="h-4 w-4 accent-marca-600"
        />
        Salvar endereço no cadastro
      </label>
    </EnderecoForm>
  );
}
