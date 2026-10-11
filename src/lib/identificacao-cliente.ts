import type { Cliente, EnderecoCliente } from "../types/cliente";
import type { EstadoConsulta } from "./consulta-por-chave";

// Identificação do cliente do delivery pelo telefone (PED-107).

export type SituacaoIdentificacao = "digitando" | "buscando" | "encontrado" | "novo" | "falhou";

// Endereço escolhido: um salvo do cliente (id) ou "novo" (cadastro, PED-108).
export type EscolhaEndereco = string | "novo";

// Mesmas regras do normalizador de telefone do backend: busca só um número que ele aceita,
// para não responder 400 no meio da digitação. Com 10 dígitos e o 3º sendo 9, é um
// celular ainda incompleto: espera o 11º.
export function telefoneProntoParaBusca(digitos: string): boolean {
  if (!/^\d+$/.test(digitos) || digitos[0] === "0" || digitos[1] === "0") {
    return false;
  }

  const primeiroDoNumero = digitos[2];

  if (digitos.length === 11) {
    return primeiroDoNumero === "9";
  }

  return digitos.length === 10 && ["2", "3", "4", "5"].includes(primeiroDoNumero);
}

export function situacaoDaIdentificacao(consulta: EstadoConsulta<Cliente | null>): SituacaoIdentificacao {
  switch (consulta.status) {
    case "idle":
      return "digitando";
    case "carregando":
      return "buscando";
    case "falhou":
      return "falhou";
    case "concluida":
      return consulta.valor === null ? "novo" : "encontrado";
  }
}

// O principal vem pré-selecionado; sem principal, o primeiro; sem endereço, cadastro.
export function enderecoPadrao(enderecos: readonly EnderecoCliente[]): EscolhaEndereco {
  return (enderecos.find((endereco) => endereco.principal) ?? enderecos[0])?.id ?? "novo";
}

// "Avenida Paulista, 1000 - Apto 52", como o endereco_resumido do painel de expedição.
export function resumoEndereco(endereco: Pick<EnderecoCliente, "logradouro" | "numero" | "complemento">): string {
  const base = `${endereco.logradouro}, ${endereco.numero}`;
  return endereco.complemento ? `${base} - ${endereco.complemento}` : base;
}

export type EnderecoDaIdentificacao = { tipo: "salvo"; enderecoId: string } | { tipo: "novo" };

export interface DadosClienteDelivery {
  cliente: { nome: string; telefone: string };
  endereco: EnderecoDaIdentificacao;
}

// Dados prontos para o pedido, ou null enquanto falta telefone válido ou nome.
export function dadosDaIdentificacao(entrada: {
  telefoneDigitos: string;
  nome: string;
  escolhaEndereco: EscolhaEndereco;
}): DadosClienteDelivery | null {
  const nome = entrada.nome.trim();

  if (!telefoneProntoParaBusca(entrada.telefoneDigitos) || nome === "") {
    return null;
  }

  return {
    cliente: { nome, telefone: entrada.telefoneDigitos },
    endereco: entrada.escolhaEndereco === "novo" ? { tipo: "novo" } : { tipo: "salvo", enderecoId: entrada.escolhaEndereco },
  };
}
