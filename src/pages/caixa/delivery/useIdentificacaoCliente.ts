import { type RefObject, useRef, useState } from "react";
import { useConsultaPorChave } from "../../../hooks/useConsultaPorChave";
import type { ResultadoConsulta } from "../../../lib/consulta-por-chave";
import {
  type DadosClienteDelivery,
  dadosDaIdentificacao,
  type EscolhaEndereco,
  enderecoPadrao,
  type SituacaoIdentificacao,
  situacaoDaIdentificacao,
  telefoneProntoParaBusca,
} from "../../../lib/identificacao-cliente";
import { mascararTelefone, somenteDigitos } from "../../../lib/mascaras";
import { buscarClientePorTelefone } from "../../../services/cliente.service";
import type { Cliente } from "../../../types/cliente";

export interface OpcoesIdentificacaoCliente {
  // Cliente recorrente: a tela leva o foco direto para o carrinho.
  onClienteEncontrado?: (cliente: Cliente) => void;
}

export interface ControleIdentificacaoCliente {
  telefone: string;
  alterarTelefone: (valor: string) => void;
  nome: string;
  alterarNome: (valor: string) => void;
  situacao: SituacaoIdentificacao;
  cliente: Cliente | null;
  escolhaEndereco: EscolhaEndereco;
  escolherEndereco: (escolha: EscolhaEndereco) => void;
  // null enquanto falta telefone válido ou nome.
  dados: DadosClienteDelivery | null;
  telefoneRef: RefObject<HTMLInputElement | null>;
  nomeRef: RefObject<HTMLInputElement | null>;
  // Volta ao estado inicial com o foco no telefone (próxima ligação).
  limpar: () => void;
}

// Estado do bloco "Cliente" do novo pedido delivery (PED-107). A tela (PED-109) é dona do
// estado: lê `dados` para montar o pedido e chama `limpar` depois de enviar.
export function useIdentificacaoCliente({
  onClienteEncontrado,
}: OpcoesIdentificacaoCliente = {}): ControleIdentificacaoCliente {
  const [telefone, setTelefone] = useState("");
  // null = nome vindo do cadastro; texto = digitado pelo atendente.
  const [nomeDigitado, setNomeDigitado] = useState<string | null>(null);
  const [escolhaManual, setEscolhaManual] = useState<{
    clienteId: string | null;
    escolha: EscolhaEndereco;
  } | null>(null);
  const telefoneRef = useRef<HTMLInputElement>(null);
  const nomeRef = useRef<HTMLInputElement>(null);

  const telefoneDigitos = somenteDigitos(telefone);

  const aoConcluirBusca = (resultado: ResultadoConsulta<Cliente | null>) => {
    if (resultado.status === "concluida" && resultado.valor !== null) {
      // O nome do cadastro prevalece sobre o que foi digitado durante a busca.
      setNomeDigitado(null);
      onClienteEncontrado?.(resultado.valor);
      return;
    }

    // Cliente novo ou busca indisponível: cadastra manualmente, começando pelo nome.
    nomeRef.current?.focus();
  };

  const consulta = useConsultaPorChave(
    telefoneProntoParaBusca(telefoneDigitos) ? telefoneDigitos : null,
    buscarClientePorTelefone,
    aoConcluirBusca,
  );

  const cliente = consulta.status === "concluida" ? consulta.valor : null;
  const clienteId = cliente?.id ?? null;
  const nome = nomeDigitado ?? cliente?.nome ?? "";
  // A escolha manual vale só para o cliente em que foi feita.
  const escolhaEndereco =
    escolhaManual !== null && escolhaManual.clienteId === clienteId
      ? escolhaManual.escolha
      : enderecoPadrao(cliente?.enderecos ?? []);

  return {
    telefone,
    alterarTelefone: (valor) => setTelefone(mascararTelefone(valor)),
    nome,
    alterarNome: setNomeDigitado,
    situacao: situacaoDaIdentificacao(consulta),
    cliente,
    escolhaEndereco,
    escolherEndereco: (escolha) => setEscolhaManual({ clienteId, escolha }),
    dados: dadosDaIdentificacao({ telefoneDigitos, nome, escolhaEndereco }),
    telefoneRef,
    nomeRef,
    limpar: () => {
      setTelefone("");
      setNomeDigitado(null);
      setEscolhaManual(null);
      telefoneRef.current?.focus();
    },
  };
}
