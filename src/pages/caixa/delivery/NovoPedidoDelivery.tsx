import { Menu, Truck } from "lucide-react";
import {
  type KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { AppShell } from "../../../components/layout/AppShell";
import { useToast } from "../../../contexts/ToastContext";
import { useCarrinho } from "../../../hooks/useCarrinho";
import { getApiErrorMessage } from "../../../lib/api-error";
import {
  itensParaCotacao,
  itensParaPedidoDelivery,
} from "../../../lib/carrinho";
import { localidadeDaEntrega } from "../../../lib/endereco-entrega";
import {
  mensagemPedidoCriado,
  montarPedidoDelivery,
  motivoQueImpedeEnvio,
} from "../../../lib/novo-pedido-delivery";
import { focarProximoCampo } from "../../../lib/teclado";
import { listCategorias } from "../../../services/categoria.service";
import { criarPedidoDelivery } from "../../../services/delivery.service";
import { listProdutos } from "../../../services/produto.service";
import type { Categoria } from "../../../types/categoria";
import type { FormaPagamento } from "../../../types/comanda";
import type { Produto } from "../../../types/produto";
import { CardapioDelivery } from "./components/CardapioDelivery";
import { EnderecoEntrega } from "./components/EnderecoEntrega";
import { IdentificacaoCliente } from "./components/IdentificacaoCliente";
import { PagamentoDelivery } from "./components/PagamentoDelivery";
import { ResumoPedidoDelivery } from "./components/ResumoPedidoDelivery";
import { useCotacaoDelivery } from "./useCotacaoDelivery";
import { useEnderecoNovo } from "./useEnderecoNovo";
import { useIdentificacaoCliente } from "./useIdentificacaoCliente";

const FORMA_PADRAO: FormaPagamento = "pix";

// Novo pedido delivery por telefone (PED-109): cliente, endereço, cardápio, pagamento e
// resumo numa tela operável só pelo teclado. Enter avança o campo; Ctrl+Enter envia.
export function NovoPedidoDelivery() {
  const { showToast } = useToast();
  const buscaRef = useRef<HTMLInputElement>(null);
  const enviandoRef = useRef(false);

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [carregandoCardapio, setCarregandoCardapio] = useState(true);
  const [erroCardapio, setErroCardapio] = useState<string | null>(null);
  const [forma, setForma] = useState<FormaPagamento>(FORMA_PADRAO);
  const [trocoParaCents, setTrocoParaCents] = useState(0);
  const [enviando, setEnviando] = useState(false);

  // Cliente recorrente: endereço já vem escolhido, então o próximo passo é o cardápio.
  const identificacao = useIdentificacaoCliente({
    onClienteEncontrado: () => buscaRef.current?.focus(),
  });
  const clienteNovo =
    identificacao.situacao === "novo" || identificacao.situacao === "falhou";
  const endereco = useEnderecoNovo(clienteNovo);
  const carrinho = useCarrinho();
  const trocoPara = trocoParaCents > 0 ? trocoParaCents / 100 : null;

  const cotacao = useCotacaoDelivery({
    localidade: localidadeDaEntrega(
      identificacao.cliente,
      identificacao.escolhaEndereco,
      endereco.campos,
    ),
    itens: itensParaCotacao(carrinho.itens),
    formaPagamento: forma,
    trocoPara,
  });

  const entrada = {
    cliente: identificacao.dados,
    enderecoNovo: endereco.endereco,
    salvarEndereco: endereco.salvarNoCadastro,
    itens: itensParaPedidoDelivery(carrinho.itens),
    formaPagamento: forma,
    trocoPara,
  };
  const motivoBloqueio = motivoQueImpedeEnvio({
    ...entrada,
    situacaoCotacao: cotacao.situacao,
    cotacao: cotacao.cotacao,
  });
  const pedido = montarPedidoDelivery(entrada);

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

  function limparFormulario() {
    endereco.limpar();
    carrinho.limpar();
    setForma(FORMA_PADRAO);
    setTrocoParaCents(0);
    // Por último: leva o foco ao telefone, pronto para a próxima ligação.
    identificacao.limpar();
  }

  async function enviar() {
    // Ref além do estado: dois Ctrl+Enter seguidos chegam antes do re-render.
    if (enviandoRef.current) {
      return;
    }

    if (motivoBloqueio !== null || pedido === null) {
      showToast(
        motivoBloqueio ?? "Complete o pedido antes de enviar.",
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
      void enviar();
      return;
    }

    // Em botões o Enter continua clicando; nos campos, avança para o próximo.
    if (
      evento.target instanceof HTMLInputElement ||
      evento.target instanceof HTMLSelectElement
    ) {
      evento.preventDefault();
      focarProximoCampo(evento.currentTarget, evento.target);
    }
  }

  return (
    <AppShell>
      {({ openSidebar }) => (
        <>
          <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-6 dark:border-slate-800 dark:bg-slate-900">
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
              avança ·{" "}
              <kbd className="rounded border border-slate-300 px-1 dark:border-slate-700">
                Ctrl+Enter
              </kbd>{" "}
              envia
            </p>
          </header>

          {/* biome-ignore lint/a11y/noStaticElementInteractions: delega o Enter dos campos internos; o contêiner não recebe foco */}
          <div
            onKeyDown={aoTeclar}
            className="grid gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start"
          >
            <div className="flex min-w-0 flex-col gap-4">
              <IdentificacaoCliente identificacao={identificacao} />
              <EnderecoEntrega
                situacaoCliente={identificacao.situacao}
                cadastrarEndereco={identificacao.escolhaEndereco === "novo"}
                endereco={endereco}
                cotacao={cotacao}
              />
              <CardapioDelivery
                produtos={produtos}
                categorias={categorias}
                carregando={carregandoCardapio}
                erro={erroCardapio}
                onRecarregar={carregarCardapio}
                onAdicionar={carrinho.adicionar}
                buscaRef={buscaRef}
              />
            </div>

            <div className="flex flex-col gap-4 lg:sticky lg:top-20">
              <ResumoPedidoDelivery
                carrinho={carrinho}
                cotacao={cotacao}
                motivoBloqueio={motivoBloqueio}
                enviando={enviando}
                onEnviar={() => void enviar()}
              />
              <PagamentoDelivery
                forma={forma}
                onForma={setForma}
                trocoParaCents={trocoParaCents}
                onTrocoParaCents={setTrocoParaCents}
                cotacao={cotacao.cotacao}
              />
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}
