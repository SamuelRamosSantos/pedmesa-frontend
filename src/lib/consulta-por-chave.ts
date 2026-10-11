// Estado de uma consulta assíncrona disparada pelo que o operador digita (CEP, telefone):
// cada consulta é marcada com a chave consultada, para uma resposta antiga nunca aparecer
// depois que o valor mudou.

export type StatusConsulta = "idle" | "carregando" | "concluida" | "falhou";

export type ResultadoConsulta<T> =
  | { chave: string; status: "concluida"; valor: T }
  | { chave: string; status: "falhou"; valor: null };

export interface EstadoConsulta<T> {
  status: StatusConsulta;
  valor: T | null;
}

// chave null = ainda não dá para consultar (valor incompleto).
export function estadoDaConsulta<T>(chave: string | null, ultimoResultado: ResultadoConsulta<T> | null): EstadoConsulta<T> {
  if (chave === null) {
    return { status: "idle", valor: null };
  }

  if (ultimoResultado === null || ultimoResultado.chave !== chave) {
    return { status: "carregando", valor: null };
  }

  return { status: ultimoResultado.status, valor: ultimoResultado.valor };
}
