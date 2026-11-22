import {
  AlertTriangle,
  MapPinned,
  Menu,
  Pencil,
  PlusCircle,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "../../components/layout/AppShell";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { Input } from "../../components/ui/Input";
import { useTenant } from "../../contexts/TenantContext";
import { useToast } from "../../contexts/ToastContext";
import { getApiErrorMessage } from "../../lib/api-error";
import { formatCurrency } from "../../lib/format";
import { listarTaxas } from "../../lib/taxas-entrega";
import {
  deleteTaxaEntrega,
  listTaxasEntrega,
  updateTaxaEntrega,
} from "../../services/delivery.service";
import type { TaxaEntrega } from "../../types/delivery";
import { TaxaEntregaModal } from "./components/TaxaEntregaModal";

// "Editando": null = nova taxa; undefined = modal fechado.
type Edicao = TaxaEntrega | null | undefined;

// Bairros atendidos e quanto custa entregar em cada um (PED-111). Só ADMIN.
export function TaxasEntrega() {
  const { tenant } = useTenant();
  const { showToast } = useToast();
  const [taxas, setTaxas] = useState<TaxaEntrega[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [editando, setEditando] = useState<Edicao>(undefined);
  const [excluindo, setExcluindo] = useState<TaxaEntrega | null>(null);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [alternandoId, setAlternandoId] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);

    try {
      setTaxas(await listTaxasEntrega());
    } catch (error) {
      setErro(
        getApiErrorMessage(
          error,
          "Não foi possível carregar as taxas de entrega.",
        ),
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const visiveis = useMemo(() => listarTaxas(taxas, busca), [taxas, busca]);

  function aoSalvar(salva: TaxaEntrega) {
    setTaxas((atuais) =>
      atuais.some((taxa) => taxa.id === salva.id)
        ? atuais.map((taxa) => (taxa.id === salva.id ? salva : taxa))
        : [...atuais, salva],
    );
    setEditando(undefined);
  }

  async function alternarAtivo(taxa: TaxaEntrega) {
    setAlternandoId(taxa.id);

    try {
      const atualizada = await updateTaxaEntrega(taxa.id, {
        ativo: !taxa.ativo,
      });
      aoSalvar(atualizada);
      showToast(
        atualizada.ativo
          ? `${taxa.bairro} voltou a ser atendido.`
          : `${taxa.bairro} deixou de ser atendido.`,
        "success",
      );
    } catch (error) {
      showToast(
        getApiErrorMessage(error, "Não foi possível atualizar a taxa."),
        "error",
      );
    } finally {
      setAlternandoId(null);
    }
  }

  async function confirmarExclusao() {
    if (!excluindo) {
      return;
    }

    setConfirmandoExclusao(true);

    try {
      await deleteTaxaEntrega(excluindo.id);
      setTaxas((atuais) => atuais.filter((taxa) => taxa.id !== excluindo.id));
      showToast(`Taxa de ${excluindo.bairro} excluída.`, "success");
      setExcluindo(null);
    } catch (error) {
      showToast(
        getApiErrorMessage(error, "Não foi possível excluir a taxa."),
        "error",
      );
    } finally {
      setConfirmandoExclusao(false);
    }
  }

  return (
    <AppShell>
      {({ openSidebar }) => (
        <>
          <header className="sticky top-0 z-10 flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-6 sm:py-4 dark:border-slate-800 dark:bg-slate-900">
            <button
              type="button"
              onClick={openSidebar}
              aria-label="Abrir menu"
              className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">
              Bairros e taxas de entrega
            </h1>
            <Button onClick={() => setEditando(null)} className="ml-auto">
              <PlusCircle className="h-4 w-4" />
              Nova taxa
            </Button>
          </header>

          <main className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-4 sm:px-6">
            {tenant && !tenant.delivery_ativo && (
              <p className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>
                  O delivery está desativado. Ative em{" "}
                  <Link
                    to="/admin/configuracoes"
                    className="font-semibold underline"
                  >
                    Configurações
                  </Link>
                  .
                </span>
              </p>
            )}

            <Card className="flex flex-col gap-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {tenant?.taxa_entrega_padrao === null
                  ? "Só os bairros ativos desta lista são atendidos."
                  : `Bairros fora desta lista são atendidos pela taxa padrão de ${formatCurrency(tenant?.taxa_entrega_padrao ?? 0)}.`}
              </p>

              <Input
                label="Buscar bairro ou cidade"
                type="search"
                icon={<Search className="h-4 w-4" />}
                value={busca}
                onChange={(evento) => setBusca(evento.target.value)}
              />

              {carregando && (
                <p className="flex items-center justify-center gap-2 py-6 text-sm text-slate-400 dark:text-slate-500">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Carregando taxas...
                </p>
              )}

              {!carregando && erro && (
                <div className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
                  {erro}
                  <Button variant="danger" onClick={carregar}>
                    Tentar novamente
                  </Button>
                </div>
              )}

              {!carregando && !erro && visiveis.length === 0 && (
                <div className="flex flex-col items-center gap-2 py-8 text-center text-slate-400 dark:text-slate-500">
                  <MapPinned className="h-8 w-8" />
                  <p className="text-sm">
                    {taxas.length === 0
                      ? "Nenhum bairro cadastrado ainda."
                      : "Nenhum bairro encontrado."}
                  </p>
                </div>
              )}

              {!carregando && !erro && visiveis.length > 0 && (
                <ul className="flex flex-col gap-2">
                  {visiveis.map((taxa) => (
                    <li
                      key={taxa.id}
                      data-testid={`taxa-${taxa.bairro}`}
                      className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-700 ${taxa.ativo ? "" : "opacity-60"}`}
                    >
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {taxa.bairro}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {taxa.cidade}
                          {taxa.tempo_estimado_min !== null &&
                            ` · ${taxa.tempo_estimado_min} min`}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">
                          {taxa.valor === 0
                            ? "Grátis"
                            : formatCurrency(taxa.valor)}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            taxa.ativo
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                              : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                          }`}
                        >
                          {taxa.ativo ? "Ativo" : "Inativo"}
                        </span>
                        <button
                          type="button"
                          onClick={() => alternarAtivo(taxa)}
                          disabled={alternandoId === taxa.id}
                          className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-200 disabled:opacity-50 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                          {taxa.ativo ? "Desativar" : "Ativar"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditando(taxa)}
                          aria-label={`Editar ${taxa.bairro}`}
                          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setExcluindo(taxa)}
                          aria-label={`Excluir ${taxa.bairro}`}
                          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-slate-500 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </main>

          {editando !== undefined && (
            <TaxaEntregaModal
              taxa={editando}
              cidadePadrao={tenant?.cidade ?? ""}
              onClose={() => setEditando(undefined)}
              onSaved={aoSalvar}
            />
          )}

          <ConfirmDialog
            isOpen={excluindo !== null}
            title={`Excluir a taxa de ${excluindo?.bairro ?? ""}?`}
            description="O bairro deixa de ter taxa própria. Pedidos já registrados não mudam. Para parar de atender só por um tempo, use Desativar."
            confirmLabel="Sim, excluir"
            isConfirming={confirmandoExclusao}
            onCancel={() => setExcluindo(null)}
            onConfirm={confirmarExclusao}
          />
        </>
      )}
    </AppShell>
  );
}
