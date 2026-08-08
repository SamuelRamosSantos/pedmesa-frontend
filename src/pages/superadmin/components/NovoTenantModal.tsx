import { LockKeyhole, Mail, Save } from "lucide-react";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Modal } from "../../../components/ui/Modal";
import { useToast } from "../../../contexts/ToastContext";
import { getApiErrorMessage } from "../../../lib/api-error";
import { createTenant } from "../../../services/super-admin.service";

interface NovoTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function NovoTenantModal({ isOpen, onClose, onSaved }: NovoTenantModalProps) {
  const [nomeFantasia, setNomeFantasia] = useState("");
  const [cnpjCpf, setCnpjCpf] = useState("");
  const [adminNome, setAdminNome] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminSenha, setAdminSenha] = useState("");

  const [nomeFantasiaError, setNomeFantasiaError] = useState<string | undefined>();
  const [cnpjCpfError, setCnpjCpfError] = useState<string | undefined>();
  const [adminNomeError, setAdminNomeError] = useState<string | undefined>();
  const [adminEmailError, setAdminEmailError] = useState<string | undefined>();
  const [adminSenhaError, setAdminSenhaError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setNomeFantasia("");
    setCnpjCpf("");
    setAdminNome("");
    setAdminEmail("");
    setAdminSenha("");
    setNomeFantasiaError(undefined);
    setCnpjCpfError(undefined);
    setAdminNomeError(undefined);
    setAdminEmailError(undefined);
    setAdminSenhaError(undefined);
    setIsSubmitting(false);
  }, [isOpen]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNomeFantasiaError(undefined);
    setCnpjCpfError(undefined);
    setAdminNomeError(undefined);
    setAdminEmailError(undefined);
    setAdminSenhaError(undefined);

    let hasError = false;

    if (!nomeFantasia.trim()) {
      setNomeFantasiaError("Informe o nome do estabelecimento.");
      hasError = true;
    }

    if (!cnpjCpf.trim()) {
      setCnpjCpfError("Informe o CNPJ ou CPF.");
      hasError = true;
    }

    if (!adminNome.trim()) {
      setAdminNomeError("Informe o nome do administrador.");
      hasError = true;
    }

    if (!EMAIL_REGEX.test(adminEmail)) {
      setAdminEmailError("Informe um e-mail válido.");
      hasError = true;
    }

    if (adminSenha.length < 6) {
      setAdminSenhaError("A senha deve ter ao menos 6 caracteres.");
      hasError = true;
    }

    if (hasError) {
      return;
    }

    setIsSubmitting(true);

    try {
      await createTenant({
        nome_fantasia: nomeFantasia.trim(),
        cnpj_cpf: cnpjCpf.trim(),
        admin_nome: adminNome.trim(),
        admin_email: adminEmail.trim().toLowerCase(),
        admin_senha: adminSenha,
      });
      showToast(`Estabelecimento "${nomeFantasia.trim()}" criado com sucesso.`, "success");
      onSaved();
    } catch (error) {
      showToast(getApiErrorMessage(error, "Não foi possível criar o estabelecimento. Tente novamente."), "error");
      setIsSubmitting(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Novo estabelecimento">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Input
          label="Nome fantasia"
          placeholder="Ex.: Lanchonete do João"
          value={nomeFantasia}
          onChange={(event) => setNomeFantasia(event.target.value)}
          error={nomeFantasiaError}
          autoFocus
        />

        <Input
          label="CNPJ ou CPF"
          placeholder="Somente números"
          value={cnpjCpf}
          onChange={(event) => setCnpjCpf(event.target.value)}
          error={cnpjCpfError}
        />

        <div className="border-t border-slate-100 pt-1 dark:border-slate-800">
          <p className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-300">Primeiro administrador</p>

          <div className="flex flex-col gap-4">
            <Input
              label="Nome"
              placeholder="Ex.: Maria Silva"
              value={adminNome}
              onChange={(event) => setAdminNome(event.target.value)}
              error={adminNomeError}
            />

            <Input
              label="E-mail"
              type="email"
              placeholder="admin@estabelecimento.com"
              icon={<Mail className="h-4 w-4" />}
              value={adminEmail}
              onChange={(event) => setAdminEmail(event.target.value)}
              error={adminEmailError}
            />

            <Input
              label="Senha"
              type="password"
              placeholder="Mínimo de 6 caracteres"
              icon={<LockKeyhole className="h-4 w-4" />}
              value={adminSenha}
              onChange={(event) => setAdminSenha(event.target.value)}
              error={adminSenhaError}
            />
          </div>
        </div>

        <div className="mt-2 flex gap-3">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting} className="flex-1">
            <Save className="h-4 w-4" />
            Criar estabelecimento
          </Button>
        </div>
      </form>
    </Modal>
  );
}
