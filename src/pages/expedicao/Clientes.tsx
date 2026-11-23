import {
  ChevronLeft,
  ChevronRight,
  Menu,
  RefreshCw,
  Search,
  UserPlus,
  Users,
} from "lucide-react";
import { useCallback, useState } from "react";
import { AppShell } from "../../components/layout/AppShell";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { ItemEditavel } from "../../components/ui/ItemEditavel";
import { useComAtraso } from "../../hooks/useComAtraso";
import { useConsultaPorChave } from "../../hooks/useConsultaPorChave";
import { formatarTermoDigitado } from "../../lib/busca-cliente";
import { totalDePaginas } from "../../lib/cadastro-cliente";
import { resumoEndereco } from "../../lib/identificacao-cliente";
import { mascararTelefone } from "../../lib/mascaras";
import { listarClientes } from "../../services/cliente.service";
import type { Cliente } from "../../types/cliente";
import { ClienteModal } from "./components/ClienteModal";

const POR_PAGINA = 20;
const ATRASO_BUSCA_MS = 300;

// "Editando": null = cliente novo; undefined = modal fechado.
type Edicao = Cliente | null | undefined;

// Clientes cadastrados do delivery (PED-124): lista paginada com a busca única por nome
// ou telefone e o cadastro/edição de cada cliente com seus endereços.
export function Clientes() {
  const [termo, setTermo] = useState("");
  const [pagina, setPagina] = useState(1);
  // Muda a cada alteração salva, para a lista ser buscada de novo.
  const [versao, setVersao] = useState(0);
  const [editando, setEditando] = useState<Edicao>(undefined);

  const busca = termo.trim();
  const buscaComAtraso = useComAtraso(busca, busca, ATRASO_BUSCA_MS);
  const aguardandoDigitacao = busca !== buscaComAtraso.chave;
  const buscaAtrasada = buscaComAtraso.valor;

  const consultar = useCallback(
    (_chave: string, signal: AbortSignal) =>
      listarClientes(
        { busca: buscaAtrasada, pagina, porPagina: POR_PAGINA },
        signal,
      ),
    [buscaAtrasada, pagina],
  );
  const consulta = useConsultaPorChave(
    aguardandoDigitacao
      ? null
      : JSON.stringify({ busca: buscaAtrasada, pagina, versao }),
    consultar,
  );

  const carregando = aguardandoDigitacao || consulta.status === "carregando";
  const lista = consulta.status === "concluida" ? consulta.valor : null;
  const paginas = lista ? totalDePaginas(lista.total, POR_PAGINA) : 1;

  function aoSalvar(salvo: Cliente) {
    setVersao((atual) => atual + 1);
    // Mantém o modal aberto mostrando o cliente salvo (ex.: depois de cadastrar).
    setEditando(salvo);
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
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                PedMesa · Delivery
              </p>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                Clientes
              </h1>
            </div>
            <Button
              onClick={() => setEditando(null)}
              className="ml-auto"
              data-testid="botao-novo-cliente"
            >
              <UserPlus className="h-4 w-4" />
              Novo cliente
            </Button>
          </header>

          <main className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-4 sm:px-6">
            <Card className="flex flex-col gap-4">
              <Input
                label="Buscar por nome ou telefone"
                type="search"
                autoComplete="off"
                placeholder="Ex.: Maria ou (11) 98765"
                icon={<Search className="h-4 w-4" />}
                value={termo}
                onChange={(evento) => {
                  setTermo(formatarTermoDigitado(evento.target.value));
                  setPagina(1);
                }}
                data-testid="busca-clientes"
              />

              {carregando && (
                <p className="flex items-center justify-center gap-2 py-6 text-sm text-slate-500 dark:text-slate-400">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Carregando clientes...
                </p>
              )}

              {!carregando && consulta.status === "falhou" && (
                <div className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
                  Não foi possível carregar os clientes.
                  <Button
                    variant="danger"
                    onClick={() => setVersao((atual) => atual + 1)}
                  >
                    Tentar novamente
                  </Button>
                </div>
              )}

              {!carregando && lista && lista.clientes.length === 0 && (
                <div className="flex flex-col items-center gap-2 py-8 text-center text-slate-500 dark:text-slate-400">
                  <Users className="h-8 w-8" />
                  {busca === "" ? (
                    <>
                      <p className="text-sm">
                        Nenhum cliente cadastrado ainda.
                      </p>
                      <p className="max-w-sm text-xs">
                        Os clientes entram aqui no primeiro pedido delivery ou
                        pelo botão "Novo cliente".
                      </p>
                    </>
                  ) : (
                    <p className="text-sm">
                      Nenhum cliente encontrado para "{busca}".
                    </p>
                  )}
                </div>
              )}

              {!carregando && lista && lista.clientes.length > 0 && (
                <>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {lista.total === 1
                      ? "1 cliente"
                      : `${lista.total} clientes`}
                  </p>
                  <ul className="flex flex-col gap-2">
                    {lista.clientes.map((cliente) => (
                      <LinhaCliente
                        key={cliente.id}
                        cliente={cliente}
                        onEditar={() => setEditando(cliente)}
                      />
                    ))}
                  </ul>
                </>
              )}

              {!carregando && lista && paginas > 1 && (
                <nav
                  aria-label="Páginas de clientes"
                  className="flex items-center justify-between gap-3 border-t border-slate-200 pt-3 text-sm dark:border-slate-800"
                >
                  <Button
                    variant="secondary"
                    disabled={pagina <= 1}
                    onClick={() => setPagina((atual) => atual - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>
                  <span className="text-slate-500 dark:text-slate-400">
                    Página {pagina} de {paginas}
                  </span>
                  <Button
                    variant="secondary"
                    disabled={pagina >= paginas}
                    onClick={() => setPagina((atual) => atual + 1)}
                  >
                    Próxima
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </nav>
              )}
            </Card>
          </main>

          {editando !== undefined && (
            <ClienteModal
              key={editando?.id ?? "novo"}
              cliente={editando}
              onClose={() => setEditando(undefined)}
              onSalvo={aoSalvar}
            />
          )}
        </>
      )}
    </AppShell>
  );
}

function LinhaCliente({
  cliente,
  onEditar,
}: {
  cliente: Cliente;
  onEditar: () => void;
}) {
  const principal = cliente.enderecos[0];
  const outros = cliente.enderecos.length - 1;

  return (
    <li>
      <ItemEditavel
        variante="linha"
        data-testid={`cliente-${cliente.telefone}`}
        aria-label={`Editar cliente ${cliente.nome}`}
        onClick={onEditar}
      >
        <div className="min-w-0">
          <p className="flex flex-wrap items-baseline gap-x-3 font-medium text-slate-900 dark:text-white">
            {cliente.nome}
            <span className="whitespace-nowrap text-sm font-normal tabular-nums text-slate-600 dark:text-slate-300">
              {mascararTelefone(cliente.telefone)}
            </span>
          </p>
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
            {principal
              ? `${resumoEndereco(principal)} · ${principal.bairro}${outros > 0 ? ` · +${outros} ${outros === 1 ? "endereço" : "endereços"}` : ""}`
              : "Sem endereço salvo"}
          </p>
        </div>
      </ItemEditavel>
    </li>
  );
}
