import {
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useComAtraso } from "../../../hooks/useComAtraso";
import { useConsultaPorChave } from "../../../hooks/useConsultaPorChave";
import {
  type CamposClienteNovo,
  type ClassificacaoBusca,
  cadastroAPartirDaBusca,
  classificarBusca,
  clienteDoTelefone,
  formatarTermoDigitado,
  pendenciaDoCadastro,
  type SituacaoBusca,
  situacaoDaBusca,
  termoParaConsulta,
} from "../../../lib/busca-cliente";
import type { ResultadoConsulta } from "../../../lib/consulta-por-chave";
import {
  type DadosClienteDelivery,
  dadosDaIdentificacao,
  type EscolhaEndereco,
  enderecoPadrao,
  telefoneProntoParaBusca,
} from "../../../lib/identificacao-cliente";
import { mascararTelefone, somenteDigitos } from "../../../lib/mascaras";
import {
  buscarClientePorTelefone,
  listarClientes,
} from "../../../services/cliente.service";
import type { Cliente, ListaClientes } from "../../../types/cliente";

// Espera o atendente parar de digitar antes de buscar.
const ATRASO_BUSCA_MS = 250;
// A busca do pedido mostra poucos resultados: o atendente refina digitando mais.
export const RESULTADOS_DA_BUSCA = 8;

const CADASTRO_VAZIO: CamposClienteNovo = { nome: "", telefone: "" };

// busca: ainda escolhendo; selecionado: cliente cadastrado; novo: cadastrando.
export type ModoCliente = "busca" | "selecionado" | "novo";

type CampoComFoco = "busca" | "nome" | "telefone";

export interface ControleBuscaCliente {
  modo: ModoCliente;
  termo: string;
  alterarTermo: (valor: string) => void;
  classificacao: ClassificacaoBusca;
  situacao: SituacaoBusca;
  resultados: Cliente[];
  // Quantos clientes batem no total (a lista mostra só os primeiros).
  total: number;
  selecionado: Cliente | null;
  selecionar: (cliente: Cliente) => void;
  cadastro: CamposClienteNovo;
  alterarCadastro: (campo: keyof CamposClienteNovo, valor: string) => void;
  iniciarCadastro: () => void;
  // No cadastro de cliente novo: o telefone digitado já é de alguém.
  telefoneJaCadastrado: Cliente | null;
  voltarParaBusca: () => void;
  escolhaEndereco: EscolhaEndereco;
  escolherEndereco: (escolha: EscolhaEndereco) => void;
  // null enquanto o cliente não está definido.
  dados: DadosClienteDelivery | null;
  // O que falta no bloco do cliente, ou null.
  pendencia: string | null;
  buscaRef: RefObject<HTMLInputElement | null>;
  nomeRef: RefObject<HTMLInputElement | null>;
  telefoneRef: RefObject<HTMLInputElement | null>;
  // Volta ao estado inicial com o foco na busca (próxima ligação).
  limpar: () => void;
}

interface OpcoesBuscaCliente {
  // Cliente escolhido (da lista ou pelo telefone exato): a tela leva o foco adiante.
  onClienteSelecionado?: (cliente: Cliente) => void;
}

// Busca única de cliente do novo pedido delivery (PED-123): um campo para nome ou
// telefone. Telefone completo cadastrado já seleciona o cliente; não cadastrado abre o
// cadastro com o número preenchido. Nome lista quem bate.
export function useBuscaCliente({
  onClienteSelecionado,
}: OpcoesBuscaCliente = {}): ControleBuscaCliente {
  const [termo, setTermo] = useState("");
  const [modo, setModo] = useState<ModoCliente>("busca");
  const [selecionado, setSelecionado] = useState<Cliente | null>(null);
  const [cadastro, setCadastro] = useState<CamposClienteNovo>(CADASTRO_VAZIO);
  const [escolhaManual, setEscolhaManual] = useState<{
    clienteId: string;
    escolha: EscolhaEndereco;
  } | null>(null);
  const [focoPendente, setFocoPendente] = useState<CampoComFoco | null>(null);
  const buscaRef = useRef<HTMLInputElement>(null);
  const nomeRef = useRef<HTMLInputElement>(null);
  const telefoneRef = useRef<HTMLInputElement>(null);

  // O campo só existe depois do render que troca o modo: o foco espera por ele.
  useEffect(() => {
    if (focoPendente === null) {
      return;
    }

    const refs = { busca: buscaRef, nome: nomeRef, telefone: telefoneRef };
    refs[focoPendente].current?.focus();
    setFocoPendente(null);
  }, [focoPendente]);

  const classificacao = classificarBusca(termo);
  const termoConsulta =
    modo === "busca" ? termoParaConsulta(classificacao) : null;
  const comAtraso = useComAtraso(
    termoConsulta,
    termoConsulta ?? "",
    ATRASO_BUSCA_MS,
  );
  const aguardandoDigitacao =
    termoConsulta !== null && termoConsulta !== comAtraso.chave;

  const consultar = useCallback(
    (busca: string, signal: AbortSignal) =>
      listarClientes({ busca, porPagina: RESULTADOS_DA_BUSCA }, signal),
    [],
  );

  function selecionar(cliente: Cliente) {
    setSelecionado(cliente);
    setModo("selecionado");
    onClienteSelecionado?.(cliente);
  }

  function iniciarCadastro() {
    const campos = cadastroAPartirDaBusca(classificacao);
    setCadastro(campos);
    setModo("novo");
    // Começa pelo campo que falta.
    setFocoPendente(campos.nome === "" ? "nome" : "telefone");
  }

  // Telefone completo: puxa o cadastro, ou abre o de cliente novo com o número.
  const aoConcluirBusca = (resultado: ResultadoConsulta<ListaClientes>) => {
    if (
      resultado.status !== "concluida" ||
      classificacao.tipo !== "telefone" ||
      !classificacao.completo ||
      classificacao.digitos !== resultado.chave
    ) {
      return;
    }

    const exato = clienteDoTelefone(
      resultado.valor.clientes,
      classificacao.digitos,
    );

    if (exato) {
      selecionar(exato);
    } else {
      iniciarCadastro();
    }
  };

  const consulta = useConsultaPorChave(
    termoConsulta === null || aguardandoDigitacao ? null : termoConsulta,
    consultar,
    aoConcluirBusca,
  );

  // Cadastro de cliente novo: confere se o telefone digitado já existe.
  const telefoneCadastro = somenteDigitos(cadastro.telefone);
  const consultaTelefone = useConsultaPorChave(
    modo === "novo" && telefoneProntoParaBusca(telefoneCadastro)
      ? telefoneCadastro
      : null,
    buscarClientePorTelefone,
  );

  const clienteId = modo === "selecionado" ? (selecionado?.id ?? null) : null;
  const escolhaEndereco: EscolhaEndereco =
    modo === "novo" || selecionado === null
      ? "novo"
      : escolhaManual !== null && escolhaManual.clienteId === clienteId
        ? escolhaManual.escolha
        : enderecoPadrao(selecionado.enderecos);

  let dados: DadosClienteDelivery | null = null;
  let pendencia: string | null =
    "Escolha um cliente na busca ou cadastre um novo.";

  if (modo === "selecionado" && selecionado !== null) {
    dados = dadosDaIdentificacao({
      telefoneDigitos: selecionado.telefone,
      nome: selecionado.nome,
      escolhaEndereco,
    });
    pendencia = null;
  }

  if (modo === "novo") {
    pendencia = pendenciaDoCadastro(cadastro);
    dados = dadosDaIdentificacao({
      telefoneDigitos: telefoneCadastro,
      nome: cadastro.nome,
      escolhaEndereco: "novo",
    });
  }

  const resultados =
    consulta.status === "concluida" && consulta.valor !== null
      ? consulta.valor.clientes
      : [];

  return {
    modo,
    termo,
    alterarTermo: (valor) => setTermo(formatarTermoDigitado(valor)),
    classificacao,
    situacao: situacaoDaBusca(classificacao, consulta, aguardandoDigitacao),
    resultados,
    total:
      consulta.status === "concluida" && consulta.valor !== null
        ? consulta.valor.total
        : 0,
    selecionado,
    selecionar,
    cadastro,
    alterarCadastro: (campo, valor) =>
      setCadastro((atual) => ({
        ...atual,
        [campo]: campo === "telefone" ? mascararTelefone(valor) : valor,
      })),
    iniciarCadastro,
    telefoneJaCadastrado:
      consultaTelefone.status === "concluida" ? consultaTelefone.valor : null,
    // O termo é limpo para a busca não repetir sozinha a escolha que se quer trocar.
    voltarParaBusca: () => {
      setTermo("");
      setModo("busca");
      setSelecionado(null);
      setFocoPendente("busca");
    },
    escolhaEndereco,
    escolherEndereco: (escolha) => {
      if (clienteId !== null) {
        setEscolhaManual({ clienteId, escolha });
      }
    },
    dados,
    pendencia,
    buscaRef,
    nomeRef,
    telefoneRef,
    limpar: () => {
      setTermo("");
      setModo("busca");
      setSelecionado(null);
      setCadastro(CADASTRO_VAZIO);
      setEscolhaManual(null);
      setFocoPendente("busca");
    },
  };
}
