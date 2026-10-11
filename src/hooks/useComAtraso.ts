import { useEffect, useEffectEvent, useState } from "react";

export interface ValorComAtraso<T> {
  chave: string;
  valor: T;
}

// Debounce: devolve o valor só depois que ele parar de mudar por `atrasoMs`. A `chave`
// identifica o valor (ex.: JSON dele), para objetos recriados a cada render não
// reiniciarem a espera.
export function useComAtraso<T>(valor: T, chave: string, atrasoMs: number): ValorComAtraso<T> {
  const [atual, setAtual] = useState<ValorComAtraso<T>>({ chave, valor });
  const valorMaisRecente = useEffectEvent(() => valor);

  useEffect(() => {
    const espera = setTimeout(() => setAtual({ chave, valor: valorMaisRecente() }), atrasoMs);
    return () => clearTimeout(espera);
  }, [chave, atrasoMs]);

  return atual;
}
