/**
 * Archivo: service-worker.js
 * Proyecto: Cotizador Gomería La Lucha
 * Descripción: Cachea el shell de la app para uso offline. Los datos de precios
 *              se piden siempre a la red primero, con caída a caché sin conexión,
 *              para no mostrar precios viejos si hay una lista nueva disponible.
 * Creado: 2026-07-12
 */

const VERSION_CACHE = 'la-lucha-v5';

const ARCHIVOS_SHELL = [
  './',
  './index.html',
  './css/estilos.css',
  './js/app.js',
  './js/buscador.js',
  './manifest.json',
  './img/icono-neumatico.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', (evento) => {
  evento.waitUntil(
    caches.open(VERSION_CACHE).then(cache => cache.addAll(ARCHIVOS_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches.keys().then(nombres =>
      Promise.all(
        nombres.filter(nombre => nombre !== VERSION_CACHE).map(nombre => caches.delete(nombre))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (evento) => {
  const url = new URL(evento.request.url);

  if (url.pathname.endsWith('/data/neumaticos.json')) {
    evento.respondWith(redActualPrimero(evento.request));
    return;
  }

  evento.respondWith(cacheActualPrimero(evento.request));
});

async function redActualPrimero(request) {
  try {
    const respuestaRed = await fetch(request);
    const cache = await caches.open(VERSION_CACHE);
    cache.put(request, respuestaRed.clone());
    return respuestaRed;
  } catch (error) {
    const respuestaCache = await caches.match(request);
    if (respuestaCache) return respuestaCache;
    throw error;
  }
}

async function cacheActualPrimero(request) {
  const respuestaCache = await caches.match(request);
  if (respuestaCache) return respuestaCache;
  return fetch(request);
}
