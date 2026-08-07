import { ArrowLeft, Building2, ChefHat, LayoutGrid, MapPin, RefreshCw, Save } from "lucide-react";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { Input } from "../../components/ui/Input";
import { Switch } from "../../components/ui/Switch";
import { ThemeToggle } from "../../components/ui/ThemeToggle";
import { useAuth } from "../../contexts/AuthContext";
import { useTenant } from "../../contexts/TenantContext";
import { useToast } from "../../contexts/ToastContext";
import { getApiErrorMessage } from "../../lib/api-error";
import { updateTenantConfiguracoes } from "../../services/tenant.service";
import { useNavigate } from "react-router-dom";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ConfiguracoesEmpresa() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tenant, isLoading, refetch } = useTenant();
  const { showToast } = useToast();

  const [nomeFantasia, setNomeFantasia] = useState("");
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
  const [emailEmpresaError, setEmailEmpresaError] = useState<string | undefined>();
  const [emailProprietarioError, setEmailProprietarioError] = useState<string | undefined>();
  const [isSavingDados, setIsSavingDados] = useState(false);

  const [confirmandoModulo, setConfirmandoModulo] = useState<boolean | null>(null);
  const [isTogglingModulo, setIsTogglingModulo] = useState(false);

  useEffect(() => {
    if (!tenant) {
      return;
    }

    setNomeFantasia(tenant.nome_fantasia);
    setRamoAtividade(tenant.ramo_atividade ?? "");
    setEmailEmpresa(tenant.email_empresa ?? "");
    setEmailProprietario(tenant.email_proprietario ?? "");
    setLogradouro(tenant.logradouro ?? "");
    setNumero(tenant.numero ?? "");
    setBairro(tenant.bairro ?? "");
    setCidade(tenant.cidade ?? "");
    setEstado(tenant.estado ?? "");
    setCep(tenant.cep ?? "");
  }, [tenant]);

  async function handleSubmitDados(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNomeFantasiaError(undefined);
    setEmailEmpresaError(undefined);
    setEmailProprietarioError(undefined);

    let hasError = false;

    if (!nomeFantasia.trim()) {
      setNomeFantasiaError("Informe o nome fantasia.");
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

    setIsSavingDados(true);

    try {
      await updateTenantConfiguracoes({
        nome_fantasia: nomeFantasia.trim(),
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
      await refetch();
      showToast("Dados da empresa atualizados com sucesso.", "success");
    } catch (error) {
      showToast(getApiErrorMessage(error, "Não foi possível salvar os dados da empresa."), "error");
    } finally {
      setIsSavingDados(false);
    }
  }

  async function handleConfirmarModulo() {
    if (confirmandoModulo === null) {
      return;
    }

    setIsTogglingModulo(true);

    try {
      await updateTenantConfiguracoes({ usa_modulo_cozinha: confirmandoModulo });
      await refetch();
      showToast(
        confirmandoModulo ? "Módulo de cozinha reativado." : "Módulo de cozinha desativado.",
        "success"
      );
      setConfirmandoModulo(null);
    } catch (error) {
      showToast(getApiErrorMessage(error, "Não foi possível atualizar essa configuração."), "error");
    } finally {
      setIsTogglingModulo(false);
    }
  }

  return (
    <div className="min-h-svh bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-20 flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-6 sm:py-4 dark:border-slate-800 dark:bg-slate-900">
        <button
          type="button"
          onClick={() => navigate("/caixa/mapa-mesas")}
          aria-label="Voltar"
          className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-600 text-white">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">PedMesa · Administração</p>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">Configurações da Empresa</h1>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-3">
          {user && user.roles.length > 1 && (
            <Button variant="secondary" onClick={() => navigate("/selecionar-visao")}>
              <LayoutGrid className="h-4 w-4" />
              Trocar Visão
            </Button>
          )}
          <ThemeToggle />
          <button
            type="button"
            onClick={refetch}
            disabled={isLoading}
            aria-label="Atualizar dados da empresa"
            className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <RefreshCw className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </header>

      <main className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-4 sm:px-6">
        {isLoading && !tenant && (
          <div className="flex flex-col items-center gap-3 py-16 text-slate-400 dark:text-slate-500">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <p className="text-sm">Carregando dados da empresa...</p>
          </div>
        )}

        {!isLoading && !tenant && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950/30">
            <p className="text-sm text-red-700 dark:text-red-300">Não foi possível carregar os dados da empresa.</p>
            <Button variant="danger" onClick={refetch}>
              Tentar novamente
            </Button>
          </div>
        )}

        {tenant && (
          <>
            <Card>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">Dados da Empresa</h2>
              <form onSubmit={handleSubmitDados} className="mt-4 flex flex-col gap-4" noValidate>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input label="Razão Social" value={tenant.razao_social ?? "Não informado"} disabled />
                  <Input label="CNPJ" value={tenant.cnpj_cpf} disabled />
                  <Input label="Inscrição Estadual (IE)" value={tenant.inscricao_estadual ?? "Não informado"} disabled />
                  <Input label="Nome do Proprietário" value={tenant.nome_proprietario ?? "Não informado"} disabled />
                  <Input label="CPF do Proprietário" value={tenant.cpf_proprietario ?? "Não informado"} disabled />
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800" />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    label="Nome Fantasia"
                    value={nomeFantasia}
                    onChange={(event) => setNomeFantasia(event.target.value)}
                    error={nomeFantasiaError}
                  />
                  <Input
                    label="Ramo de Atividade"
                    placeholder="Ex.: Alimentação"
                    value={ramoAtividade}
                    onChange={(event) => setRamoAtividade(event.target.value)}
                  />
                  <Input
                    label="E-mail da Empresa"
                    type="email"
                    placeholder="contato@empresa.com"
                    value={emailEmpresa}
                    onChange={(event) => setEmailEmpresa(event.target.value)}
                    error={emailEmpresaError}
                  />
                  <Input
                    label="E-mail do Proprietário"
                    type="email"
                    placeholder="proprietario@empresa.com"
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
                  <Input
                    label="Logradouro"
                    placeholder="Ex.: Rua das Flores"
                    value={logradouro}
                    onChange={(event) => setLogradouro(event.target.value)}
                  />
                  <Input
                    label="Número"
                    placeholder="Ex.: 123"
                    value={numero}
                    onChange={(event) => setNumero(event.target.value)}
                  />
                  <Input
                    label="Bairro"
                    value={bairro}
                    onChange={(event) => setBairro(event.target.value)}
                  />
                  <Input
                    label="Cidade"
                    value={cidade}
                    onChange={(event) => setCidade(event.target.value)}
                  />
                  <Input
                    label="Estado (UF)"
                    placeholder="Ex.: PR"
                    maxLength={2}
                    value={estado}
                    onChange={(event) => setEstado(event.target.value.toUpperCase())}
                  />
                  <Input
                    label="CEP"
                    placeholder="00000-000"
                    value={cep}
                    onChange={(event) => setCep(event.target.value)}
                  />
                </div>

                <Button type="submit" isLoading={isSavingDados} className="self-start">
                  <Save className="h-4 w-4" />
                  Salvar Alterações
                </Button>
              </form>
            </Card>

            <Card>
              <div className="flex items-center gap-2">
                <ChefHat className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">Módulo de Cozinha</h2>
              </div>

              <div className="mt-4">
                <Switch
                  checked={tenant.usa_modulo_cozinha}
                  onChange={(novoValor) => setConfirmandoModulo(novoValor)}
                  label="Usa módulo de visão e preparo na cozinha"
                  description={
                    tenant.usa_modulo_cozinha
                      ? "Os pedidos seguem o fluxo normal de preparo (pendente → em preparo → pronto) conforme a configuração de cada produto."
                      : 'Desativado: todo pedido nasce direto como "pronto" e o garçom marca como entregue sem passar pelas etapas de preparo.'
                  }
                />
              </div>
            </Card>
          </>
        )}
      </main>

      <ConfirmDialog
        isOpen={confirmandoModulo !== null}
        title={confirmandoModulo ? "Reativar módulo de cozinha?" : "Desativar módulo de cozinha?"}
        description={
          confirmandoModulo
            ? 'A partir de agora, novos pedidos voltam a respeitar o campo "Requer preparo na cozinha/bar?" de cada produto, passando pelas etapas normais de preparo na cozinha. Será possível conceder a visão de cozinha para usuários novamente.'
            : 'A partir de agora, os pedidos enviados pelo garçom já nascerão prontos, pulando as etapas de preparo. Não será possível conceder acesso à visão de cozinha para usuários, e o campo "Requer preparo na cozinha/bar?" do cadastro de produtos ficará oculto (todo produto passa a ser auto-pronto).'
        }
        confirmLabel={confirmandoModulo ? "Sim, reativar" : "Sim, desativar"}
        isConfirming={isTogglingModulo}
        onCancel={() => setConfirmandoModulo(null)}
        onConfirm={handleConfirmarModulo}
      />
    </div>
  );
}
