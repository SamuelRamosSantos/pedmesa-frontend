// Service worker mínimo: só existe para deixar o PedMesa instalável ("Adicionar à
// tela inicial") e permitir abrir o app-shell (HTML/JS/CSS/ícones) mesmo sem rede.
// Propositalmente NÃO faz cache de chamadas à API — dados de mesas/comandas/pedidos
// sempre vêm da rede, para não arriscar mostrar informação desatualizada num sistema
// de pedidos. Bump em CACHE_NAME invalida o cache antigo no próximo deploy.
const CACHE_NAME = "pedmesa-shell-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached ?? caches.match("/")))
  );
});
