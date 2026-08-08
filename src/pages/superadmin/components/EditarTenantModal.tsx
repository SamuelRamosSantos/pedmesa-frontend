import { MapPin, Save } from "lucide-react";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Modal } from "../../../components/ui/Modal";
import { useToast } from "../../../contexts/ToastContext";
import { getApiErrorMessage } from "../../../lib/api-error";
import { updateTenant } from "../../../services/super-admin.service";
import type { TenantAdminItem } from "../../../types/super-admin";

interface EditarTenantModalProps {
  tenant: TenantAdminItem | null;
  onClose: () => void;
  onSaved: (tenantAtualizado: TenantAdminItem) => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function EditarTenantModal({ tenant, onClose, onSaved }: EditarTenantModalProps) {
  const [nomeFantasia, setNomeFantasia] = useState("");
  const [cnpjCpf, setCnpjCpf] = useState("");
  const [razaoSocial, setRazaoSocial] = useState("");
  const [inscricaoEstadual, setInscricaoEstadual] = useState("");
  const [nomeProprietario, setNomeProprietario] = useState("");
  const [cpfProprietario, setCpfProprietario] = useState("");
  const [quantidadeComandas, setQuantidadeComandas] = useState("");
  const [ramoAtividade, setRamoAtividade] = useState("");
  const [emailEmpresa, setEmailEmpresa] = useState("");
  const [emailProprietario, setEmailProprietario] = useState("");
  const [logradouro, setLogradouro] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [cep, setCep] = useState("");

  const [nomeFantasiaError, setNomeFantasiaError] = useState<string | undefined>();
  const [cnpjCpfError, setCnpjCpfError] = useState<string | undefined>();
  const [quantidadeComandasError, setQuantidadeComandasError] = useState<string | undefined>();
  const [emailEmpresaError, setEmailEmpresaError] = useState<string | undefined>();
  const [emailProprietarioError, setEmailProprietarioError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    if (!tenant) {
      return;
    }

    setNomeFantasia(tenant.nome_fantasia);
    setCnpjCpf(tenant.cnpj_cpf);
    setRazaoSocial(tenant.razao_social ?? "");
    setInscricaoEstadual(tenant.inscricao_estadual ?? "");
    setNomeProprietario(tenant.nome_proprietario ?? "");
    setCpfProprietario(tenant.cpf_proprietario ?? "");
    setQuantidadeComandas(String(tenant.quantidade_comandas));
    setRamoAtividade(tenant.ramo_atividade ?? "");
    setEmailEmpresa(tenant.email_empresa ?? "");
    setEmailProprietario(tenant.email_proprietario ?? "");
    setLogradouro(tenant.logradouro ?? "");
    setNumero(tenant.numero ?? "");
    setBairro(tenant.bairro ?? "");
    setCidade(tenant.cidade ?? "");
    setEstado(tenant.estado ?? "");
    setCep(tenant.cep ?? "");

    setNomeFantasiaError(undefined);
    setCnpjCpfError(undefined);
    setQuantidadeComandasError(undefined);
    setEmailEmpresaError(undefined);
    setEmailProprietarioError(undefined);
    setIsSubmitting(false);
  }, [tenant]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!tenant) {
      return;
    }

    setNomeFantasiaError(undefined);
    setCnpjCpfError(undefined);
    setQuantidadeComandasError(undefined);
    setEmailEmpresaError(undefined);
    setEmailProprietarioError(undefined);

    let hasError = false;
    const quantidadeComandasNumero = Number(quantidadeComandas);

    if (!nomeFantasia.trim()) {
      setNomeFantasiaError("Informe o nome fantasia.");
      hasError = true;
    }

    if (!cnpjCpf.trim()) {
      setCnpjCpfError("Informe o CNPJ ou CPF.");
      hasError = true;
    }

    if (!Number.isInteger(quantidadeComandasNumero) || quantidadeComandasNumero <= 0) {
      setQuantidadeComandasError("Informe um número inteiro maior que zero.");
      hasError = true;
    }

    if (emailEmpresa.trim() && !EMAIL_REGEX.test(emailEmpresa.trim())) {
      setEmailEmpresaError("Informe um e-mail válido.");
      hasError = true;
    }

    if (emailProprietario.trim() && !EMAIL_REGEX.test(emailProprietario.trim())) {
      setEmailProprietarioError("Informe um e-mail válido.");
      hasError = true;
    }

    if (hasError) {
      return;
    }

    setIsSubmitting(true);

    try {
      const atualizado = await updateTenant(tenant.id, {
        nome_fantasia: nomeFantasia.trim(),
        cnpj_cpf: cnpjCpf.trim(),
        razao_social: razaoSocial.trim() || null,
        inscricao_estadual: inscricaoEstadual.trim() || null,
        nome_proprietario: nomeProprietario.trim() || null,
        cpf_proprietario: cpfProprietario.trim() || null,
        quantidade_comandas: quantidadeComandasNumero,
        ramo_atividade: ramoAtividade.trim() || null,
        email_empresa: emailEmpresa.trim() || null,
        email_proprietario: emailProprietario.trim() || null,
        logradouro: logradouro.trim() || null,
        numero: numero.trim() || null,
        bairro: bairro.trim() || null,
        cidade: cidade.trim() || null,
        estado: estado.trim() || null,
        cep: cep.trim() || null,
      });
      showToast(`Estabelecimento "${atualizado.nome_fantasia}" atualizado com sucesso.`, "success");
      onSaved(atualizado);
    } catch (error) {
      showToast(getApiErrorMessage(error, "Não foi possível salvar as alterações. Tente novamente."), "error");
      setIsSubmitting(false);
    }
  }

  return (
    <Modal isOpen={tenant !== null} onClose={onClose} title="Editar estabelecimento">
      <form onSubmit={handleSubmit} className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-1" noValidate>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Nome Fantasia"
            value={nomeFantasia}
            onChange={(event) => setNomeFantasia(event.target.value)}
            error={nomeFantasiaError}
            autoFocus
          />
          <Input
            label="CNPJ/CPF"
            value={cnpjCpf}
            onChange={(event) => setCnpjCpf(event.target.value)}
            error={cnpjCpfError}
          />
          <Input label="Razão Social" value={razaoSocial} onChange={(event) => setRazaoSocial(event.target.value)} />
          <Input
            label="Inscrição Estadual (IE)"
            value={inscricaoEstadual}
            onChange={(event) => setInscricaoEstadual(event.target.value)}
          />
          <Input
            label="Nome do Proprietário"
            value={nomeProprietario}
            onChange={(event) => setNomeProprietario(event.target.value)}
          />
          <Input
            label="CPF do Proprietário"
            value={cpfProprietario}
            onChange={(event) => setCpfProprietario(event.target.value)}
          />
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Quantidade de Mesas Disponíveis"
            type="number"
            inputMode="numeric"
            min={1}
            value={quantidadeComandas}
            onChange={(event) => setQuantidadeComandas(event.target.value)}
            error={quantidadeComandasError}
          />
          <Input label="Ramo de Atividade" value={ramoAtividade} onChange={(event) => setRamoAtividade(event.target.value)} />
          <Input
            label="E-mail da Empresa"
            type="email"
            value={emailEmpresa}
            onChange={(event) => setEmailEmpresa(event.target.value)}
            error={emailEmpresaError}
          />
          <Input
            label="E-mail do Proprietário"
            type="email"
            value={emailProprietario}
            onChange={(event) => setEmailProprietario(event.target.value)}
            error={emailProprietarioError}
          />
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800" />

        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-slate-400 dark:text-slate-500" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Endereço</span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Logradouro" value={logradouro} onChange={(event) => setLogradouro(event.target.value)} />
          <Input label="Número" value={numero} onChange={(event) => setNumero(event.target.value)} />
          <Input label="Bairro" value={bairro} onChange={(event) => setBairro(event.target.value)} />
          <Input label="Cidade" value={cidade} onChange={(event) => setCidade(event.target.value)} />
          <Input
            label="Estado (UF)"
            maxLength={2}
            value={estado}
            onChange={(event) => setEstado(event.target.value.toUpperCase())}
          />
          <Input label="CEP" value={cep} onChange={(event) => setCep(event.target.value)} />
        </div>

        <div className="mt-2 flex gap-3">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting} className="flex-1">
            <Save className="h-4 w-4" />
            Salvar Alterações
          </Button>
        </div>
      </form>
    </Modal>
  );
}
