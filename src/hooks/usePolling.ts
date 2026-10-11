import { useEffect, useEffectEvent } from "react";

// Executa `tarefa` já ao montar e depois a cada `intervaloMs`. Com a aba oculta o polling
// pausa (nada de requisições para uma tela que ninguém vê) e, ao voltar, atualiza na hora
// e retoma o intervalo. Usado pelo KDS e pelo painel de expedição.
export function usePolling(tarefa: () => unknown, intervaloMs: number): void {
  const executar = useEffectEvent(() => {
    void tarefa();
  });

  useEffect(() => {
    let intervalo: ReturnType<typeof setInterval> | null = null;

    const iniciar = () => {
      if (intervalo !== null) {
        return;
      }

      executar();
      intervalo = setInterval(executar, intervaloMs);
    };

    const parar = () => {
      if (intervalo !== null) {
        clearInterval(intervalo);
        intervalo = null;
      }
    };

    const aoMudarVisibilidade = () => (document.hidden ? parar() : iniciar());

    if (!document.hidden) {
      iniciar();
    }

    document.addEventListener("visibilitychange", aoMudarVisibilidade);

    return () => {
      parar();
      document.removeEventListener("visibilitychange", aoMudarVisibilidade);
    };
  }, [intervaloMs]);
}
