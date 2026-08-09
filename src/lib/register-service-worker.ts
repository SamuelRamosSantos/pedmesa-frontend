export function registerServiceWorker(): void {
  if (!import.meta.env.PROD || !("serviceWorker" in navigator)) {
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Instalação como PWA é um extra — se o registro falhar, o app continua
      // funcionando normalmente pelo navegador.
    });
  });
}
