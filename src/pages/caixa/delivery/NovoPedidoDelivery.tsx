import { ArrowLeft, ArrowRight, Menu, Truck } from "lucide-react";
import {
  type KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { AppShell } from "../../../components/layout/AppShell";
import { Button } from "../../../components/ui";
import { BarraEtapas } from "../../../components/ui/BarraEtapas";
import { useToast } from "../../../contexts/ToastContext";
import { useCarrinho } from "../../../hooks/useCarrinho";
import { getApiErrorMessage } from "../../../lib/api-error";
import {
  itensParaCotacao,
  itensParaPedidoDelivery,
} from "../../../lib/carrinho";
import { localidadeDaEntrega } from "../../../lib/endereco-entrega";
import { resumoEndereco } from "../../../lib/identificacao-cliente";
import {
  type EstadoEnvio,
  ETAPAS_PEDIDO,
  type EtapaPedido,
  etapaConcluida,
  etapaLiberada,
  mensagemPedidoCriado,
  montarPedidoDelivery,
  motivoQueImpedeEnvio,
  pendenciaDaEtapa,
  primeiraPendencia,
} from "../../../lib/novo-pedido-delivery";
import { focarProximoCampo } from "../../../lib/teclado";
import { listCategorias } from "../../../services/categoria.service";
import { criarPedidoDelivery } from "../../../services/delivery.service";
import { listProdutos } from "../../../services/produto.service";
import type { Categoria } from "../../../types/categoria";
import type { FormaPagamento } from "../../../types/comanda";
import type { Produto } from "../../../types/produto";
import { EtapaCliente } from "./etapas/EtapaCliente";
import { EtapaPagamento, type ResumoEntrega } from "./etapas/EtapaPagamento";
import { EtapaProdutos } from "./etapas/EtapaProdutos";
import { type ControleBuscaCliente, useBuscaCliente } from "./useBuscaCliente";
import { useCotacaoDelivery } from "./useCotacaoDelivery";
import { type ControleEnderecoNovo, useEnderecoNovo } from "./useEnderecoNovo";

const FORMA_PADRAO: FormaPagamento = "pix";

function textoDoEndereco(
  busca: ControleBuscaCliente,
  endereco: ControleEnderecoNovo,
): string {
  const origem =
    busca.escolhaEndereco === "novo"
      ? endereco.endereco
      : (busca.selecionado?.enderecos.find(
          (salvo) => salvo.id === busca.escolhaEndereco,
        ) ?? null);

  return origem === null
    ? "Endereço incompleto"
    : `${resumoEndereco(origem)} · ${origem.bairro}, ${origem.cidade}/${origem.uf}`;
}

// Novo pedido delivery por telefone (PED-109), em três etapas desde o PED-123: cliente e
// endereço, produtos, pagamento e revisão. Operável só pelo teclado: Enter avança o
// campo; Ctrl+Enter avança a etapa e, na última, envia.
export function NovoPedidoDelivery() {
  const { showToast } = useToast();
  const conteudoRef = useRef<HTMLDivElement>(null);
  const buscaProdutoRef = useRef<HTMLInputElement>(null);
  const continuarRef = useRef<HTMLButtonElement>(null);
  const enviarRef = useRef<HTMLButtonElement>(null);
  const enviandoRef = useRef(false);

  const [etapa, setEtapa] = useState<EtapaPedido>("cliente");
  // Só mostra o motivo de não avançar depois de uma tentativa.
  const [tentouAvancar, setTentouAvancar] = useState(false);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [carregandoCardapio, setCarregandoCardapio] = useState(true);
  const [erroCardapio, setErroCardapio] = useState<string | null>(null);
  const [forma, setForma] = useState<FormaPagamento>(FORMA_PADRAO);
  const [trocoParaCents, setTrocoParaCents] = useState(0);
  const [enviando, setEnviando] = useState(false);

  // Cliente escolhido: o endereço já vem pré-selecionado, então o próximo passo é
  // continuar.
  const busca = useBuscaCliente({
    onClienteSelecionado: () => continuarRef.current?.focus(),
  });
  const endereco = useEnderecoNovo(busca.modo === "novo");
  const carrinho = useCarrinho();
  const trocoPara = trocoParaCents > 0 ? trocoParaCents / 100 : null;

  const cotacao = useCotacaoDelivery({
    localidade: localidadeDaEntrega(
      busca.selecionado,
      busca.escolhaEndereco,
      endereco.campos,
    ),
    itens: itensParaCotacao(carrinho.itens),
    formaPagamento: forma,
    trocoPara,
  });

  const entrada = {
    cliente: busca.dados,
    enderecoNovo: endereco.endereco,
    salvarEndereco: endereco.salvarNoCadastro,
    itens: itensParaPedidoDelivery(carrinho.itens),
    formaPagamento: forma,
    trocoPara,
  };
  const estado: EstadoEnvio = {
    ...entrada,
    motivoCliente: busca.pendencia,
    situacaoCotacao: cotacao.situacao,
    cotacao: cotacao.cotacao,
  };
  const pedido = montarPedidoDelivery(entrada);
  const indiceAtual = ETAPAS_PEDIDO.findIndex(({ id }) => id === etapa);
  const pendenciaAtual = pendenciaDaEtapa(etapa, estado);
  const entrega: ResumoEntrega | null =
    busca.dados === null
      ? null
      : {
          nome: busca.dados.cliente.nome,
          telefone: busca.dados.cliente.telefone,
          endereco: textoDoEndereco(busca, endereco),
        };

  const carregarCardapio = useCallback(async () => {
    setCarregandoCardapio(true);
    setErroCardapio(null);

    try {
      const [produtosData, categoriasData] = await Promise.all([
        listProdutos(),
        listCategorias(),
      ]);
      setProdutos(produtosData);
      setCategorias(categoriasData);
    } catch (error) {
      setErroCardapio(
        getApiErrorMessage(error, "Não foi possível carregar o cardápio."),
      );
    } finally {
      setCarregandoCardapio(false);
    }
  }, []);

  useEffect(() => {
    carregarCardapio();
  }, [carregarCardapio]);

  // Ao abrir uma etapa, o foco vai para onde o atendente começa: a busca de cliente (ou
  // "Continuar", se já há cliente), a busca de produto ou a forma de pagamento escolhida.
  // Na última etapa o foco não vai para "Enviar", para um Enter segurado não enviar.
  const modoCliente = busca.modo;
  const buscaClienteRef = busca.buscaRef;
  // biome-ignore lint/correctness/useExhaustiveDependencies: só ao trocar de etapa; a troca do modo do cliente tem o próprio controle de foco
  useEffect(() => {
    if (etapa === "cliente") {
      (modoCliente === "busca"
        ? buscaClienteRef
        : continuarRef
      ).current?.focus();
    } else if (etapa === "produtos") {
      buscaProdutoRef.current?.focus();
    } else {
      conteudoRef.current
        ?.querySelector<HTMLButtonElement>('button[aria-pressed="true"]')
        ?.focus();
    }
  }, [etapa]);

  function irPara(indice: number) {
    const destino = ETAPAS_PEDIDO[indice];

    if (destino && etapaLiberada(destino.id, estado)) {
      setEtapa(destino.id);
      setTentouAvancar(false);
    }
  }

  function avancar() {
    if (pendenciaAtual !== null) {
      setTentouAvancar(true);
      return;
    }

    irPara(indiceAtual + 1);
  }

  function limparFormulario() {
    endereco.limpar();
    carrinho.limpar();
    setForma(FORMA_PADRAO);
    setTrocoParaCents(0);
    setTentouAvancar(false);
    setEtapa("cliente");
    // Por último: leva o foco à busca, pronto para a próxima ligação.
    busca.limpar();
  }

  async function enviar() {
    // Ref além do estado: dois Ctrl+Enter seguidos chegam antes do re-render.
    if (enviandoRef.current) {
      return;
    }

    const pendencia = primeiraPendencia(estado);

    if (pendencia !== null || pedido === null) {
      if (pendencia !== null) {
        setEtapa(pendencia.etapa);
        setTentouAvancar(true);
      }
      showToast(
        motivoQueImpedeEnvio(estado) ?? "Complete o pedido antes de enviar.",
        "error",
      );
      return;
    }

    enviandoRef.current = true;
    setEnviando(true);

    try {
      const criado = await criarPedidoDelivery(pedido);
      showToast(mensagemPedidoCriado(criado.numero_entrega), "success");
      limparFormulario();
    } catch (error) {
      showToast(
        getApiErrorMessage(error, "Não foi possível criar o pedido delivery."),
        "error",
      );
    } finally {
      enviandoRef.current = false;
      setEnviando(false);
    }
  }

  function aoTeclar(evento: KeyboardEvent<HTMLDivElement>) {
    if (evento.key !== "Enter" || evento.defaultPrevented) {
      return;
    }

    if (evento.ctrlKey || evento.metaKey) {
      evento.preventDefault();
      if (etapa === "pagamento") {
        void enviar();
      } else {
        avancar();
      }
      return;
    }

    // Em botões o Enter continua clicando; nos campos, avança para o próximo. Depois do
    // último campo, o foco vai para "Continuar".
    if (
      evento.target instanceof HTMLInputElement ||
      evento.target instanceof HTMLSelectElement
    ) {
      evento.preventDefault();
      const conteudo = conteudoRef.current;

      if (conteudo === null || !focarProximoCampo(conteudo, evento.target)) {
        continuarRef.current?.focus();
      }
    }
  }

  return (
    <AppShell>
      {({ openSidebar }) => (
        // biome-ignore lint/a11y/noStaticElementInteractions: delega o Enter dos campos internos; o contêiner não recebe foco
        <div onKeyDown={aoTeclar} className="flex min-h-svh flex-col">
          <header className="sticky top-0 z-20 flex flex-col gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={openSidebar}
                aria-label="Abrir menu"
                className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
              <Truck className="hidden h-5 w-5 text-orange-600 sm:block" />
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  PedMesa · Delivery
                </p>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                  Novo pedido delivery
                </h1>
              </div>
              <p className="ml-auto hidden text-xs text-slate-500 md:block dark:text-slate-400">
                <kbd className="rounded border border-slate-300 px-1 dark:border-slate-700">
                  Enter
                </kbd>{" "}
                avança o campo ·{" "}
                <kbd className="rounded border border-slate-300 px-1 dark:border-slate-700">
                  Ctrl+Enter
                </kbd>{" "}
                {etapa === "pagamento" ? "envia" : "próxima etapa"}
              </p>
            </div>

            <BarraEtapas
              rotulo="Etapas do pedido"
              etapas={ETAPAS_PEDIDO}
              atual={indiceAtual}
              concluida={(indice) =>
                etapaConcluida(ETAPAS_PEDIDO[indice].id, estado)
              }
              liberada={(indice) =>
                etapaLiberada(ETAPAS_PEDIDO[indice].id, estado)
              }
              onIr={irPara}
            />
          </header>

          <div
            ref={conteudoRef}
            key={etapa}
            className="flex-1 px-4 py-4 sm:px-6"
            data-testid={`conteudo-etapa-${etapa}`}
          >
            {etapa === "cliente" && (
              <EtapaCliente
                busca={busca}
                endereco={endereco}
                cotacao={cotacao}
              />
            )}
            {etapa === "produtos" && (
              <EtapaProdutos
                produtos={produtos}
                categorias={categorias}
                carregando={carregandoCardapio}
                erro={erroCardapio}
                onRecarregar={carregarCardapio}
                carrinho={carrinho}
                cotacao={cotacao}
                buscaRef={buscaProdutoRef}
              />
            )}
            {etapa === "pagamento" && (
              <EtapaPagamento
                forma={forma}
                onForma={setForma}
                trocoParaCents={trocoParaCents}
                onTrocoParaCents={setTrocoParaCents}
                carrinho={carrinho}
                cotacao={cotacao}
                entrega={entrega}
                motivoBloqueio={tentouAvancar ? pendenciaAtual : null}
                enviando={enviando}
                onEnviar={() => void enviar()}
                enviarRef={enviarRef}
              />
            )}
          </div>

          <footer className="sticky bottom-0 z-10 flex flex-wrap items-center gap-3 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6 dark:border-slate-800 dark:bg-slate-900/95">
            {indiceAtual > 0 && (
              <Button
                variant="secondary"
                onClick={() => irPara(indiceAtual - 1)}
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            )}

            {tentouAvancar &&
              pendenciaAtual !== null &&
              etapa !== "pagamento" && (
                <p
                  role="status"
                  data-testid="pendencia-etapa"
                  className="text-sm font-medium text-amber-700 dark:text-amber-400"
                >
                  {pendenciaAtual}
                </p>
              )}

            {etapa !== "pagamento" && (
              <Button
                ref={continuarRef}
                onClick={avancar}
                className="ml-auto"
                data-testid="botao-continuar"
              >
                Continuar
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </footer>
        </div>
      )}
    </AppShell>
  );
}
