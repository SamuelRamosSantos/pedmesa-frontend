import { useEffect, useEffectEvent, useState } from "react";
import { estadoDaConsulta, type EstadoConsulta, type ResultadoConsulta } from "../lib/consulta-por-chave";

// Consulta assíncrona que acompanha um valor digitado: ao mudar a chave, cancela a
// consulta anterior. `consultar` deve ser estável (função de módulo ou useCallback).
// `aoConcluir` roda uma vez por resposta da chave atual (ex.: mover o foco).
export function useConsultaPorChave<T>(
  chave: string | null,
  consultar: (chave: string, signal: AbortSignal) => Promise<T>,
  aoConcluir?: (resultado: ResultadoConsulta<T>) => void
): EstadoConsulta<T> {
  const [ultimoResultado, setUltimoResultado] = useState<ResultadoConsulta<T> | null>(null);
  const notificar = useEffectEvent((resultado: ResultadoConsulta<T>) => aoConcluir?.(resultado));

  useEffect(() => {
    if (chave === null) {
      return;
    }

    const controller = new AbortController();
    const registrar = (resultado: ResultadoConsulta<T>) => {
      setUltimoResultado(resultado);
      notificar(resultado);
    };

    consultar(chave, controller.signal).then(
      (valor) => registrar({ chave, status: "concluida", valor }),
      () => {
        // Cancelado por nós (valor mudou ou tela fechou): não é falha.
        if (!controller.signal.aborted) {
          registrar({ chave, status: "falhou", valor: null });
        }
      }
    );

    return () => controller.abort();
  }, [chave, consultar]);

  return estadoDaConsulta(chave, ultimoResultado);
}
