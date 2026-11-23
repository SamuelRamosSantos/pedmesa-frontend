import {
  AlertTriangle,
  MapPinned,
  Menu,
  PlusCircle,
  RefreshCw,
  Search,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { TaxaEntregaModal } from "../../components/delivery/TaxaEntregaModal";
import { AppShell } from "../../components/layout/AppShell";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { ItemEditavel } from "../../components/ui/ItemEditavel";
import { Selo } from "../../components/ui/Selo";
import { TituloPagina } from "../../components/ui/TituloPagina";
import { useTenant } from "../../contexts/TenantContext";
import { getApiErrorMessage } from "../../lib/api-error";
import { formatCurrency } from "../../lib/format";
import { listarTaxas } from "../../lib/taxas-entrega";
import { CLASSES_DO_TOM } from "../../lib/tons";
import { listTaxasEntrega } from "../../services/delivery.service";
import type { TaxaEntrega } from "../../types/delivery";

// "Editando": null = nova taxa; undefined = modal fechado.
type Edicao = TaxaEntrega | null | undefined;

// Bairros atendidos e quanto custa entregar em cada um (PED-111). Só ADMIN.
export function TaxasEntrega() {
  const { tenant } = useTenant();
  const [taxas, setTaxas] = useState<TaxaEntrega[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [editando, setEditando] = useState<Edicao>(undefined);

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

  function aoExcluir(taxaId: string) {
    setTaxas((atuais) => atuais.filter((taxa) => taxa.id !== taxaId));
    setEditando(undefined);
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
            <TituloPagina>Bairros e taxas de entrega</TituloPagina>
            <Button onClick={() => setEditando(null)} className="ml-auto">
              <PlusCircle className="h-4 w-4" />
              Nova taxa
            </Button>
          </header>

          <main className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-4 sm:px-6">
            {tenant && !tenant.delivery_ativo && (
              <p
                className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-corpo ${CLASSES_DO_TOM.aviso.superficie}`}
              >
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
              <p className="text-corpo text-slate-500 dark:text-slate-400">
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
                <p className="flex items-center justify-center gap-2 py-6 text-corpo text-slate-400 dark:text-slate-500">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Carregando taxas...
                </p>
              )}

              {!carregando && erro && (
                <div
                  className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-corpo ${CLASSES_DO_TOM.perigo.superficie} ${CLASSES_DO_TOM.perigo.texto}`}
                >
                  {erro}
                  <Button variant="danger" onClick={carregar}>
                    Tentar novamente
                  </Button>
                </div>
              )}

              {!carregando && !erro && visiveis.length === 0 && (
                <div className="flex flex-col items-center gap-2 py-8 text-center text-slate-400 dark:text-slate-500">
                  <MapPinned className="h-8 w-8" />
                  <p className="text-corpo">
                    {taxas.length === 0
                      ? "Nenhum bairro cadastrado ainda."
                      : "Nenhum bairro encontrado."}
                  </p>
                </div>
              )}

              {!carregando && !erro && visiveis.length > 0 && (
                <ul className="flex flex-col gap-2">
                  {visiveis.map((taxa) => (
                    <li key={taxa.id}>
                      <ItemEditavel
                        variante="linha"
                        inativo={!taxa.ativo}
                        data-testid={`taxa-${taxa.bairro}`}
                        aria-label={`Editar taxa de ${taxa.bairro}`}
                        onClick={() => setEditando(taxa)}
                      >
                        <div>
                          <p className="text-corpo font-medium text-slate-900 dark:text-white">
                            {taxa.bairro}
                          </p>
                          <p className="text-legenda text-slate-500 dark:text-slate-400">
                            {taxa.cidade}
                            {taxa.tempo_estimado_min !== null &&
                              ` · ${taxa.tempo_estimado_min} min`}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-corpo font-semibold tabular-nums text-slate-900 dark:text-white">
                            {taxa.valor === 0
                              ? "Grátis"
                              : formatCurrency(taxa.valor)}
                          </span>
                          <Selo tom={taxa.ativo ? "sucesso" : "neutro"}>
                            {taxa.ativo ? "Ativo" : "Inativo"}
                          </Selo>
                        </div>
                      </ItemEditavel>
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
              onDeleted={aoExcluir}
            />
          )}
        </>
      )}
    </AppShell>
  );
}
