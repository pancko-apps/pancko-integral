const CACHE_NAME = 'pancko-integral-v0.10.47';

const APP_ASSETS = [
  './',
  './index.html',
  './data/version.json',
  './data/articulos.csv',
  './data/clientes.csv',
  './data/recetas.csv'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key.startsWith('pancko') && key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

function isRepoDataFile(url){
  return url.pathname.endsWith('/data/version.json') ||
         url.pathname.endsWith('/data/articulos.csv') ||
         url.pathname.endsWith('/data/clientes.csv') ||
         url.pathname.endsWith('/data/recetas.csv');
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put('./index.html', copy));
          return response;
        })
        .catch(() => caches.match('./index.html').then(cached => cached || caches.match('./')))
    );
    return;
  }

  // Los datos del repo son network-first: si hay conexión, trae lo nuevo.
  // Si no hay conexión, usa Cache Storage para mantener el offline.
  if (isRepoDataFile(url)) {
    event.respondWith(
      fetch(request, { cache: 'reload' })
        .then(response => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => caches.match(request, { ignoreSearch: true }))
    );
    return;
  }

  event.respondWith(
    caches.match(request, { ignoreSearch: true })
      .then(cached => {
        const networkFetch = fetch(request)
          .then(response => {
            if (response && response.status === 200) {
              const copy = response.clone();
              caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
            }
            return response;
          })
          .catch(() => cached);

        return cached || networkFetch;
      })
  );
});

// Pancko cache bump v0.10.47 data-network-first
