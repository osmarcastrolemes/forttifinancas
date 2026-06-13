const CACHE_NAME = 'forttifinancas-v1';
const URLS_TO_CACHE = [
  '/forttifinancas/',
  '/forttifinancas/index.html',
  '/forttifinancas/cadastro.html',
  '/forttifinancas/dashboard.html',
  '/forttifinancas/lancamento.html',
  '/forttifinancas/relatorios.html',
  '/forttifinancas/app.js',
  '/forttifinancas/css/style.css'
];

// Instalação: faz cache dos arquivos principais
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Ativação: limpa caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: serve do cache, com fallback para rede
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(response => {
        // Armazena novas respostas no cache dinamicamente
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      });
    }).catch(() => {
      // Fallback offline para páginas HTML
      if (event.request.destination === 'document') {
        return caches.match('/forttifinancas/');
      }
    })
  );
});
