import { LockKeyhole, Save, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Modal } from "../../../components/ui/Modal";
import { Switch } from "../../../components/ui/Switch";
import { useAuth } from "../../../contexts/AuthContext";
import { useToast } from "../../../contexts/ToastContext";
import { getApiErrorMessage } from "../../../lib/api-error";
import { createUsuario, updateUsuario } from "../../../services/usuario.service";
import type { UserRole } from "../../../types/auth";
import type { Usuario } from "../../../types/usuario";

interface UsuarioModalProps {
  isOpen: boolean;
  usuarioEditando: Usuario | null;
  onClose: () => void;
  onSaved: () => void;
}

interface OpcaoRole {
  role: UserRole;
  label: string;
}

const OPCOES_ROLE: OpcaoRole[] = [
  { role: "admin", label: "Admin" },
  { role: "garcom", label: "Garçom" },
  { role: "cozinha", label: "Cozinha" },
  { role: "caixa", label: "Caixa" },
];

export function UsuarioModal({ isOpen, usuarioEditando, onClose, onSaved }: UsuarioModalProps) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [podeExcluirItemFechamento, setPodeExcluirItemFechamento] = useState(false);
  const [podeConcederDesconto, setPodeConcederDesconto] = useState(false);

  const [nomeError, setNomeError] = useState<string | undefined>();
  const [emailError, setEmailError] = useState<string | undefined>();
  const [senhaError, setSenhaError] = useState<string | undefined>();
  const [rolesError, setRolesError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user: usuarioLogado } = useAuth();
  const { showToast } = useToast();
  const isEdicao = usuarioEditando !== null;
  const isEditandoProprioUsuario = isEdicao && usuarioEditando.id === usuarioLogado?.id;
  const alvoJaEhAdmin = usuarioEditando?.roles.includes("admin") ?? false;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (usuarioEditando) {
      setNome(usuarioEditando.nome);
      setEmail(usuarioEditando.email);
      setRoles(usuarioEditando.roles);
      setPodeExcluirItemFechamento(usuarioEditando.pode_excluir_item_fechamento);
      setPodeConcederDesconto(usuarioEditando.pode_conceder_desconto);
    } else {
      setNome("");
      setEmail("");
      setRoles([]);
      setPodeExcluirItemFechamento(false);
      setPodeConcederDesconto(false);
    }

    setSenha("");
    setNomeError(undefined);
    setEmailError(undefined);
    setSenhaError(undefined);
    setRolesError(undefined);
    setIsSubmitting(false);
  }, [isOpen, usuarioEditando]);

  function handleToggleRole(role: UserRole) {
    if (role === "admin" && isEditandoProprioUsuario) {
      return;
    }

    setRoles((current) => (current.includes(role) ? current.filter((r) => r !== role) : [...current, role]));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNomeError(undefined);
    setEmailError(undefined);
    setSenhaError(undefined);
    setRolesError(undefined);

    let hasError = false;

    if (!nome.trim()) {
      setNomeError("Informe o nome do usuário.");
      hasError = true;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Informe um e-mail válido.");
      hasError = true;
    }

    if (!isEdicao && senha.length < 6) {
      setSenhaError("A senha deve ter ao menos 6 caracteres.");
      hasError = true;
    }

    if (roles.length === 0) {
      setRolesError("Selecione ao menos uma visão para o usuário.");
      hasError = true;
    }

    if (hasError) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (usuarioEditando) {
        await updateUsuario(usuarioEditando.id, {
          nome: nome.trim(),
          email: email.trim().toLowerCase(),
          roles,
          pode_excluir_item_fechamento: podeExcluirItemFechamento,
          pode_conceder_desconto: podeConcederDesconto,
        });
        showToast(`Usuário "${nome.trim()}" atualizado com sucesso.`, "success");
      } else {
        await createUsuario({
          nome: nome.trim(),
          email: email.trim().toLowerCase(),
          senha,
          roles,
          pode_excluir_item_fechamento: podeExcluirItemFechamento,
          pode_conceder_desconto: podeConcederDesconto,
        });
        showToast(`Usuário "${nome.trim()}" cadastrado com sucesso.`, "success");
      }

      onSaved();
    } catch (error) {
      showToast(getApiErrorMessage(error, "Não foi possível salvar o usuário. Tente novamente."), "error");
      setIsSubmitting(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdicao ? "Editar usuário" : "Novo usuário"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Input
          label="Nome"
          placeholder="Ex.: Maria Silva"
          value={nome}
          onChange={(event) => setNome(event.target.value)}
          error={nomeError}
          autoFocus
        />

        <Input
          label="E-mail"
          type="email"
          placeholder="usuario@email.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={emailError}
        />

        {!isEdicao && (
          <Input
            label="Senha"
            type="password"
            placeholder="Mínimo de 6 caracteres"
            icon={<LockKeyhole className="h-4 w-4" />}
            value={senha}
            onChange={(event) => setSenha(event.target.value)}
            error={senhaError}
          />
        )}

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Visões (papéis de acesso)</p>

          <div className="flex flex-col gap-2 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
            {OPCOES_ROLE.map((opcao) => {
              const disabled = opcao.role === "admin" && isEditandoProprioUsuario;

              return (
                <label
                  key={opcao.role}
                  className={`flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300 ${
                    disabled ? "opacity-60" : "cursor-pointer"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={roles.includes(opcao.role)}
                    onChange={() => handleToggleRole(opcao.role)}
                    disabled={disabled}
                    className="h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500 dark:border-slate-600 dark:bg-slate-800"
                  />
                  {opcao.label}
                  {opcao.role === "admin" && (
                    <ShieldCheck className="h-3.5 w-3.5 text-orange-500" aria-hidden="true" />
                  )}
                </label>
              );
            })}
          </div>

          {isEditandoProprioUsuario && alvoJaEhAdmin && (
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Você não pode remover sua própria permissão de Admin.
            </p>
          )}

          {rolesError && <p className="text-sm text-red-600 dark:text-red-400">{rolesError}</p>}
        </div>

        <div className="flex flex-col gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
          <Switch
            checked={podeExcluirItemFechamento}
            onChange={setPodeExcluirItemFechamento}
            label="Pode excluir item no fechamento"
            description="Permite remover um item lançado por engano durante o fechamento da conta no caixa."
          />

          <div className="border-t border-slate-100 dark:border-slate-800" />

          <Switch
            checked={podeConcederDesconto}
            onChange={setPodeConcederDesconto}
            label="Pode conceder desconto"
            description="Permite aplicar desconto (percentual ou em R$) no fechamento da conta no caixa."
          />
        </div>

        <div className="mt-2 flex gap-3">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting} className="flex-1">
            <Save className="h-4 w-4" />
            Salvar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
