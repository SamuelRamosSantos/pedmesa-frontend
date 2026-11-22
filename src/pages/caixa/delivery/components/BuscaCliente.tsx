import { AlertTriangle, Loader2, Search, UserPlus } from "lucide-react";
import type { KeyboardEvent, ReactNode } from "react";
import { Input } from "../../../../components/ui";
import { resumoEndereco } from "../../../../lib/identificacao-cliente";
import { mascararTelefone } from "../../../../lib/mascaras";
import type { ControleBuscaCliente } from "../useBuscaCliente";

interface BuscaClienteProps {
  busca: ControleBuscaCliente;
}

function textoDoCadastro(busca: ControleBuscaCliente): string {
  const { classificacao } = busca;

  if (classificacao.tipo === "nome") {
    return `Cadastrar "${classificacao.texto}" como cliente novo`;
  }

  if (classificacao.tipo === "telefone") {
    return `Cadastrar cliente novo com ${mascararTelefone(classificacao.digitos)}`;
  }

  return "Cadastrar cliente novo";
}

function Aviso({
  icone,
  children,
  tom = "neutro",
}: {
  icone?: ReactNode;
  children: ReactNode;
  tom?: "neutro" | "alerta";
}) {
  return (
    <p
      className={`flex items-center gap-2 text-sm ${
        tom === "alerta"
          ? "text-amber-700 dark:text-amber-400"
          : "text-slate-500 dark:text-slate-400"
      }`}
    >
      {icone}
      {children}
    </p>
  );
}

// Campo único "nome ou telefone" e os resultados (PED-123). Pelo teclado: Enter escolhe
// o primeiro resultado (ou abre o cadastro quando não há nenhum) e as setas percorrem
// a lista.
export function BuscaCliente({ busca }: BuscaClienteProps) {
  const { situacao, resultados, total, classificacao } = busca;
  const listaId = "resultados-busca-cliente";

  function focarResultado(indice: number) {
    document
      .querySelectorAll<HTMLButtonElement>(`#${listaId} button`)
      [indice]?.focus();
  }

  function aoTeclarNaBusca(evento: KeyboardEvent<HTMLInputElement>) {
    if (evento.key === "ArrowDown" && resultados.length > 0) {
      evento.preventDefault();
      focarResultado(0);
      return;
    }

    if (evento.key !== "Enter" || evento.ctrlKey || evento.metaKey) {
      return;
    }

    // Enter fica sempre na busca: enquanto ela não responde, não pula para outro campo.
    evento.preventDefault();

    if (situacao === "resultados" && resultados[0]) {
      busca.selecionar(resultados[0]);
    } else if (situacao === "sem_resultado" || situacao === "falhou") {
      busca.iniciarCadastro();
    }
  }

  function aoTeclarNoResultado(
    evento: KeyboardEvent<HTMLButtonElement>,
    indice: number,
  ) {
    if (evento.key === "ArrowDown") {
      evento.preventDefault();
      focarResultado(Math.min(indice + 1, resultados.length - 1));
    } else if (evento.key === "ArrowUp") {
      evento.preventDefault();
      if (indice === 0) {
        busca.buscaRef.current?.focus();
      } else {
        focarResultado(indice - 1);
      }
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Input
        ref={busca.buscaRef}
        label="Buscar cliente por nome ou telefone"
        type="search"
        autoComplete="off"
        placeholder="Ex.: Maria ou (11) 98765-4321"
        icon={<Search className="h-4 w-4" />}
        value={busca.termo}
        onChange={(evento) => busca.alterarTermo(evento.target.value)}
        onKeyDown={aoTeclarNaBusca}
        aria-controls={resultados.length > 0 ? listaId : undefined}
        data-testid="busca-cliente"
      />

      <div role="status" aria-live="polite">
        {situacao === "vazia" && (
          <Aviso>Digite o nome ou o telefone com DDD.</Aviso>
        )}
        {situacao === "curta" && <Aviso>Continue digitando...</Aviso>}
        {situacao === "buscando" && (
          <Aviso icone={<Loader2 className="h-4 w-4 animate-spin" />}>
            Buscando clientes...
          </Aviso>
        )}
        {situacao === "resultados" && (
          <Aviso>
            {total === 1
              ? "1 cliente encontrado. Enter escolhe."
              : total > resultados.length
                ? `${total} clientes encontrados; mostrando os ${resultados.length} primeiros. Digite mais para refinar.`
                : `${total} clientes encontrados. Enter escolhe o primeiro.`}
          </Aviso>
        )}
        {situacao === "sem_resultado" && (
          <Aviso>
            {classificacao.tipo === "telefone"
              ? "Nenhum cliente com esse telefone."
              : "Nenhum cliente com esse nome."}{" "}
            Enter cadastra um novo.
          </Aviso>
        )}
        {situacao === "falhou" && (
          <Aviso tom="alerta" icone={<AlertTriangle className="h-4 w-4" />}>
            Não foi possível buscar agora. Você pode cadastrar o cliente mesmo
            assim.
          </Aviso>
        )}
      </div>

      {resultados.length > 0 && situacao === "resultados" && (
        <ul id={listaId} className="flex flex-col gap-1.5">
          {resultados.map((cliente, indice) => {
            const principal = cliente.enderecos[0];

            return (
              <li key={cliente.id}>
                <button
                  type="button"
                  onClick={() => busca.selecionar(cliente)}
                  onKeyDown={(evento) => aoTeclarNoResultado(evento, indice)}
                  data-testid={`resultado-cliente-${cliente.telefone}`}
                  className={`flex w-full flex-wrap items-center gap-x-3 gap-y-0.5 rounded-lg border px-3.5 py-2.5 text-left text-sm transition-colors hover:border-orange-300 hover:bg-orange-50/60 focus-visible:border-orange-500 focus-visible:bg-orange-50 focus-visible:outline-none dark:hover:border-orange-500/50 dark:hover:bg-orange-950/20 dark:focus-visible:bg-orange-950/30 ${
                    indice === 0
                      ? "border-slate-300 dark:border-slate-600"
                      : "border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {cliente.nome}
                  </span>
                  <span className="whitespace-nowrap tabular-nums text-slate-600 dark:text-slate-300">
                    {mascararTelefone(cliente.telefone)}
                  </span>
                  <span className="w-full truncate text-xs text-slate-500 dark:text-slate-400 sm:ml-auto sm:w-auto">
                    {principal
                      ? `${resumoEndereco(principal)} · ${principal.bairro}`
                      : "Sem endereço salvo"}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <button
        type="button"
        onClick={busca.iniciarCadastro}
        data-testid="botao-cadastrar-cliente"
        className="flex w-fit items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold text-orange-700 transition-colors hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-950/30"
      >
        <UserPlus className="h-4 w-4" />
        {textoDoCadastro(busca)}
      </button>
    </div>
  );
}
