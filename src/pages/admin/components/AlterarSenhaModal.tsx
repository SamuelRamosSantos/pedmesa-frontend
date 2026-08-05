import { KeyRound, LockKeyhole } from "lucide-react";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Modal } from "../../../components/ui/Modal";
import { useToast } from "../../../contexts/ToastContext";
import { getApiErrorMessage } from "../../../lib/api-error";
import { alterarSenhaUsuario } from "../../../services/usuario.service";
import type { Usuario } from "../../../types/usuario";

interface AlterarSenhaModalProps {
  isOpen: boolean;
  usuario: Usuario | null;
  onClose: () => void;
  onSaved: () => void;
}

export function AlterarSenhaModal({ isOpen, usuario, onClose, onSaved }: AlterarSenhaModalProps) {
  const [novaSenha, setNovaSenha] = useState("");
  const [senhaError, setSenhaError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setNovaSenha("");
    setSenhaError(undefined);
    setIsSubmitting(false);
  }, [isOpen]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSenhaError(undefined);

    if (!usuario) {
      return;
    }

    if (novaSenha.length < 6) {
      setSenhaError("A senha deve ter ao menos 6 caracteres.");
      return;
    }

    setIsSubmitting(true);

    try {
      await alterarSenhaUsuario(usuario.id, novaSenha);
      showToast(`Senha de "${usuario.nome}" atualizada com sucesso.`, "success");
      onSaved();
    } catch (error) {
      showToast(getApiErrorMessage(error, "Não foi possível alterar a senha. Tente novamente."), "error");
      setIsSubmitting(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={usuario ? `Alterar senha de ${usuario.nome}` : "Alterar senha"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Input
          label="Nova senha"
          type="password"
          placeholder="Mínimo de 6 caracteres"
          icon={<LockKeyhole className="h-4 w-4" />}
          value={novaSenha}
          onChange={(event) => setNovaSenha(event.target.value)}
          error={senhaError}
          autoFocus
        />

        <div className="mt-2 flex gap-3">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting} className="flex-1">
            <KeyRound className="h-4 w-4" />
            Alterar senha
          </Button>
        </div>
      </form>
    </Modal>
  );
}
