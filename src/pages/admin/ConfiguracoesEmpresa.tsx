import {
  ArrowLeft,
  ChefHat,
  Copy,
  KeyRound,
  LayoutGrid,
  MapPin,
  Pencil,
  Printer,
  PlusCircle,
  RefreshCw,
  Save,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import logoIcon from "../../assets/logo-icon.svg";
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
import { deleteImpressora, listImpressoras, updateImpressora } from "../../services/impressora.service";
import { regenerateTokenAgente, updateTenantConfiguracoes } from "../../services/tenant.service";
import type { Impressora } from "../../types/impressora";
import { useNavigate } from "react-router-dom";
import { ImpressoraModal } from "./components/ImpressoraModal";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ConfiguracoesEmpresa() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tenant, isLoading, refetch } = useTenant();
  const { showToast } = useToast();

  const [nomeFantasia, setNomeFantasia] = useState("");
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
  const [quantidadeComandasError, setQuantidadeComandasError] = useState<string | undefined>();
  const [emailEmpresaError, setEmailEmpresaError] = useState<string | undefined>();
  const [emailProprietarioError, setEmailProprietarioError] = useState<string | undefined>();
  const [isSavingDados, setIsSavingDados] = useState(false);

  const [confirmandoModulo, setConfirmandoModulo] = useState<boolean | null>(null);
  const [isTogglingModulo, setIsTogglingModulo] = useState(false);

  const [impressoras, setImpressoras] = useState<Impressora[]>([]);
  const [isLoadingImpressoras, setIsLoadingImpressoras] = useState(true);
  const [isImpressoraModalOpen, setIsImpressoraModalOpen] = useState(false);
  const [impressoraEditando, setImpressoraEditando] = useState<Impressora | null>(null);
  const [togglingImpressoraId, setTogglingImpressoraId] = useState<string | null>(null);
  const [deletingImpressoraId, setDeletingImpressoraId] = useState<string | null>(null);

  const [isConfirmandoNovoToken, setIsConfirmandoNovoToken] = useState(false);
  const [isRegenerandoToken, setIsRegenerandoToken] = useState(false);

  const fetchImpressoras = useCallback(async () => {
    setIsLoadingImpressoras(true);

    try {
      const data = await listImpressoras();
      setImpressoras(data);
    } catch (error) {
      showToast(getApiErrorMessage(error, "Não foi possível carregar as impressoras."), "error");
    } finally {
      setIsLoadingImpressoras(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchImpressoras();
  }, [fetchImpressoras]);

  useEffect(() => {
    if (!tenant) {
      return;
    }

    setNomeFantasia(tenant.nome_fantasia);
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
  }, [tenant]);

  async function handleSubmitDados(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNomeFantasiaError(undefined);
    setQuantidadeComandasError(undefined);
    setEmailEmpresaError(undefined);
    setEmailProprietarioError(undefined);

    let hasError = false;

    if (!nomeFantasia.trim()) {
      setNomeFantasiaError("Informe o nome fantasia.");
      hasError = true;
    }

    const quantidadeComandasNumero = Number(quantidadeComandas);
    if (
      !quantidadeComandas ||
      !Number.isInteger(quantidadeComandasNumero) ||
      quantidadeComandasNumero <= 0
    ) {
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

    setIsSavingDados(true);

    try {
      await updateTenantConfiguracoes({
        nome_fantasia: nomeFantasia.trim(),
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

  function handleNovaImpressora() {
    setImpressoraEditando(null);
    setIsImpressoraModalOpen(true);
  }

  function handleEditarImpressora(impressora: Impressora) {
    setImpressoraEditando(impressora);
    setIsImpressoraModalOpen(true);
  }

  function handleImpressoraModalSaved() {
    setIsImpressoraModalOpen(false);
    setImpressoraEditando(null);
    fetchImpressoras();
  }

  async function handleToggleAtivoImpressora(impressora: Impressora) {
    setTogglingImpressoraId(impressora.id);

    try {
      const atualizada = await updateImpressora(impressora.id, { ativo: !impressora.ativo });
      setImpressoras((current) => current.map((item) => (item.id === impressora.id ? atualizada : item)));
      showToast(
        atualizada.ativo ? `"${impressora.nome}" ativada.` : `"${impressora.nome}" desativada.`,
        "success"
      );
    } catch (error) {
      showToast(getApiErrorMessage(error, "Não foi possível atualizar a impressora."), "error");
    } finally {
      setTogglingImpressoraId(null);
    }
  }

  async function handleExcluirImpressora(impressora: Impressora) {
    if (!window.confirm(`Tem certeza que deseja excluir a impressora "${impressora.nome}"?`)) {
      return;
    }

    setDeletingImpressoraId(impressora.id);

    try {
      await deleteImpressora(impressora.id);
      setImpressoras((current) => current.filter((item) => item.id !== impressora.id));
      showToast(`Impressora "${impressora.nome}" excluída.`, "success");
    } catch (error) {
      showToast(getApiErrorMessage(error, "Não foi possível excluir a impressora."), "error");
    } finally {
      setDeletingImpressoraId(null);
    }
  }

  async function handleCopiarToken() {
    if (!tenant?.token_agente) {
      return;
    }

    try {
      await navigator.clipboard.writeText(tenant.token_agente);
      showToast("Token copiado para a área de transferência.", "success");
    } catch {
      showToast("Não foi possível copiar o token. Selecione e copie manualmente.", "error");
    }
  }

  async function handleConfirmarNovoToken() {
    setIsRegenerandoToken(true);

    try {
      await regenerateTokenAgente();
      await refetch();
      showToast("Novo token do agente gerado com sucesso.", "success");
      setIsConfirmandoNovoToken(false);
    } catch (error) {
      showToast(getApiErrorMessage(error, "Não foi possível gerar um novo token."), "error");
    } finally {
      setIsRegenerandoToken(false);
    }
  }

  return (
    <div className="min-h-svh bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-20 flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-6 sm:py-4 dark:border-slate-800 dark:bg-slate-900">
        <button
          type="button"
          onClick={() => navigate("/admin/dashboard")}
          aria-label="Voltar"
          className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <img src={logoIcon} alt="PedMesa" className="h-11 w-11 rounded-xl" />
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
                    label="Quantidade de Mesas Disponíveis"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    placeholder="Ex.: 20"
                    value={quantidadeComandas}
                    onChange={(event) => setQuantidadeComandas(event.target.value)}
                    error={quantidadeComandasError}
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

            <Card>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Printer className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <h2 className="text-base font-semibold text-slate-900 dark:text-white">Impressoras</h2>
                </div>
                <Button onClick={handleNovaImpressora}>
                  <PlusCircle className="h-4 w-4" />
                  Nova Impressora
                </Button>
              </div>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Cadastre as impressoras de rede (IP) que devem receber os pedidos enviados pelo garçom.
              </p>

              <div className="mt-4 flex flex-col gap-2">
                {isLoadingImpressoras && (
                  <div className="flex items-center justify-center gap-2 py-6 text-slate-400 dark:text-slate-500">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <p className="text-sm">Carregando impressoras...</p>
                  </div>
                )}

                {!isLoadingImpressoras && impressoras.length === 0 && (
                  <p className="py-4 text-center text-sm text-slate-400 dark:text-slate-500">
                    Nenhuma impressora cadastrada ainda.
                  </p>
                )}

                {!isLoadingImpressoras &&
                  impressoras.map((impressora) => (
                    <div
                      key={impressora.id}
                      data-testid={`impressora-card-${impressora.nome}`}
                      className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-700 ${
                        impressora.ativo ? "" : "opacity-60"
                      }`}
                    >
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{impressora.nome}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {impressora.ip}:{impressora.porta}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            impressora.ativo
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                              : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                          }`}
                        >
                          {impressora.ativo ? "Ativa" : "Inativa"}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleToggleAtivoImpressora(impressora)}
                          disabled={togglingImpressoraId === impressora.id}
                          className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-200 disabled:opacity-50 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                          {impressora.ativo ? "Desativar" : "Ativar"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleEditarImpressora(impressora)}
                          aria-label={`Editar ${impressora.nome}`}
                          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleExcluirImpressora(impressora)}
                          disabled={deletingImpressoraId === impressora.id}
                          aria-label={`Excluir ${impressora.nome}`}
                          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:text-slate-500 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>

              <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Agente de Impressão Desktop</h3>
                </div>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Use esse token para configurar o aplicativo <strong>pedmesa-print-agent</strong> no computador do
                  caixa, para imprimir numa impressora USB local.
                </p>

                {tenant.token_agente ? (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Input
                      label="Token do Agente"
                      value={tenant.token_agente}
                      disabled
                      className="flex-1 font-mono text-xs"
                    />
                    <Button type="button" variant="secondary" onClick={handleCopiarToken}>
                      <Copy className="h-4 w-4" />
                      Copiar
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => setIsConfirmandoNovoToken(true)}>
                      <KeyRound className="h-4 w-4" />
                      Gerar novo token
                    </Button>
                  </div>
                ) : (
                  <div className="mt-3">
                    <Button type="button" onClick={() => setIsConfirmandoNovoToken(true)}>
                      <KeyRound className="h-4 w-4" />
                      Gerar Token do Agente
                    </Button>
                  </div>
                )}
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

      <ConfirmDialog
        isOpen={isConfirmandoNovoToken}
        title="Gerar novo token do agente?"
        description="O token atual deixará de funcionar imediatamente. Qualquer PedMesa Print Agent já configurado com o token antigo vai parar de conseguir buscar a fila de impressão até ser reconfigurado com o novo token."
        confirmLabel="Sim, gerar novo token"
        isConfirming={isRegenerandoToken}
        onCancel={() => setIsConfirmandoNovoToken(false)}
        onConfirm={handleConfirmarNovoToken}
      />

      <ImpressoraModal
        isOpen={isImpressoraModalOpen}
        impressoraEditando={impressoraEditando}
        onClose={() => {
          setIsImpressoraModalOpen(false);
          setImpressoraEditando(null);
        }}
        onSaved={handleImpressoraModalSaved}
      />
    </div>
  );
}
