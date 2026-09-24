const CACHE = 'zvonki-v2';

const FILES = [
  './',
  './index.html',
  './schedule.js',
  './manifest.json'
];
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Сначала пробуем сеть
  e.respondWith(
    fetch(e.request).then(res => {
      // Если получилось — обновляем кэш и возвращаем
      if (res.ok && e.request.method === 'GET') {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
      }
      return res;
    }).catch(() => {
      // Нет сети — берём из кэша
      return caches.match(e.request);
    })
  );
});