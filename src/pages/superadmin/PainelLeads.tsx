import { ArrowLeft, Building2, RefreshCw, Search, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import logoIcon from "../../assets/logo-icon.svg";
import { Button } from "../../components/ui/Button";
import { ThemeToggle } from "../../components/ui/ThemeToggle";
import { getApiErrorMessage } from "../../lib/api-error";
import { formatDataHora } from "../../lib/format";
import { listLeads } from "../../services/super-admin.service";
import type { LeadAdminItem } from "../../types/super-admin";

function formatWhatsapp(whatsapp: string): string {
  if (whatsapp.length !== 10 && whatsapp.length !== 11) {
    return whatsapp;
  }

  const ddd = whatsapp.slice(0, 2);
  const resto = whatsapp.slice(2);
  const meio = resto.length === 9 ? resto.slice(0, 5) : resto.slice(0, 4);
  const fim = resto.length === 9 ? resto.slice(5) : resto.slice(4);

  return `(${ddd}) ${meio}-${fim}`;
}

export function PainelLeads() {
  const navigate = useNavigate();

  const [leads, setLeads] = useState<LeadAdminItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await listLeads();
      setLeads(data);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Não foi possível carregar os leads."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const leadsFiltrados = useMemo(() => {
    const termo = searchTerm.trim().toLowerCase();

    if (!termo) {
      return leads;
    }

    return leads.filter(
      (lead) =>
        lead.nome.toLowerCase().includes(termo) ||
        lead.nome_estabelecimento.toLowerCase().includes(termo) ||
        lead.email.toLowerCase().includes(termo)
    );
  }, [leads, searchTerm]);

  return (
    <div className="min-h-svh bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/admin")}
            aria-label="Voltar aos estabelecimentos"
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <img src={logoIcon} alt="PedMesa" className="h-11 w-11 rounded-xl" />
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">PedMesa · Painel Super-Admin</p>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">Leads</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => navigate("/admin")}>
            <Building2 className="h-4 w-4" />
            Estabelecimentos
          </Button>
          <ThemeToggle />
          <button
            type="button"
            onClick={fetchLeads}
            disabled={isLoading}
            aria-label="Atualizar lista de leads"
            className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <RefreshCw className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-6">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-slate-400" />
          <label htmlFor="busca-lead" className="sr-only">
            Buscar lead pelo nome, estabelecimento ou e-mail
          </label>
          <input
            id="busca-lead"
            type="search"
            placeholder="Buscar por nome, estabelecimento ou e-mail..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
          />
        </div>

        <div className="mt-6">
          {isLoading && (
            <div className="flex flex-col items-center gap-3 py-16 text-slate-400 dark:text-slate-500">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <p className="text-sm">Carregando leads...</p>
            </div>
          )}

          {!isLoading && errorMessage && (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950/30">
              <p className="text-sm text-red-700 dark:text-red-300">{errorMessage}</p>
              <Button variant="danger" onClick={fetchLeads}>
                Tentar novamente
              </Button>
            </div>
          )}

          {!isLoading && !errorMessage && leadsFiltrados.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-16 text-center text-slate-400 dark:text-slate-500">
              <ShieldCheck className="h-10 w-10" />
              <p className="text-sm">Nenhum lead encontrado.</p>
            </div>
          )}

          {!isLoading && !errorMessage && leadsFiltrados.length > 0 && (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800 dark:text-slate-500">
                    <th className="px-4 py-3 font-medium">Nome</th>
                    <th className="px-4 py-3 font-medium">Estabelecimento</th>
                    <th className="px-4 py-3 font-medium">E-mail</th>
                    <th className="px-4 py-3 font-medium">WhatsApp</th>
                    <th className="px-4 py-3 font-medium">CPF/CNPJ</th>
                    <th className="px-4 py-3 font-medium">Recebido em</th>
                  </tr>
                </thead>
                <tbody>
                  {leadsFiltrados.map((lead) => (
                    <tr
                      key={lead.id}
                      data-testid={`lead-row-${lead.nome}`}
                      className="border-b border-slate-50 last:border-0 dark:border-slate-800/60"
                    >
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{lead.nome}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{lead.nome_estabelecimento}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{lead.email}</td>
                      <td className="px-4 py-3">
                        <a
                          href={`https://wa.me/55${lead.whatsapp}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-orange-600 hover:underline dark:text-orange-400"
                        >
                          {formatWhatsapp(lead.whatsapp)}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{lead.cpf_cnpj}</td>
                      <td className="px-4 py-3 text-slate-400 dark:text-slate-500">{formatDataHora(lead.criado_em)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
