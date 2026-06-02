const CACHE_NAME = 'greenherb-v5';
const CACHE_API = 'greenherb-api';

const RECURSOS = [
    '/frontend/views/home.html',
    '/frontend/views/lotes.html',
    '/frontend/views/tarefas.html',
    '/frontend/views/plano.html',
    '/frontend/views/plantas.html',
    '/frontend/views/alertas.html',
    '/frontend/css/style.css',
    '/frontend/js/ambient.js',
    '/frontend/js/db.js',
    '/frontend/js/home.js',
    '/frontend/js/lotes.js',
    '/frontend/js/tarefas.js',
    '/frontend/js/planos.js',
    '/frontend/js/plantas.js',
    '/frontend/js/alertas.js',
    '/frontend/js/utilizadores.js',
];

self.addEventListener('install', function (event) {
    event.waitUntil(caches.open(CACHE_NAME).then(function (cache) {
        console.log('Cache aberto');
        return cache.addAll(RECURSOS);
    }));
    self.skipWaiting();
});

self.addEventListener('fetch', function (event) {
    const url = new URL(event.request.url);

    if (event.request.url.includes(':5000/api/') && event.request.method === 'GET') {
        event.respondWith(
            fetch(event.request)
                .then(function (response) {
                    const clone = response.clone();
                    caches.open(CACHE_API).then(cache => cache.put(event.request, clone));
                    return response;
                })
                .catch(function () {
                    return caches.match(event.request).then(function (cached) {
                        if (cached) return cached;
                        return new Response(
                            JSON.stringify({ sucesso: true, dados: [], offline: true }),
                            { headers: { 'Content-Type': 'application/json' } }
                        );
                    });
                })
        );
        return;
    }
    if (event.request.url.includes(':5000/api/')) return;

    if (url.origin !== location.origin) return;

    event.respondWith(
        caches.match(event.request).then(function (response) {
            if (response) return response;
            return fetch(event.request).then(function (response) {
                if (!response || response.status !== 200 || response.type !== 'basic') return response;
                var clone = response.clone();
                caches.open(CACHE_NAME).then(function (cache) {
                    cache.put(event.request, clone);
                });
                return response;
            }).catch(function () {
                return caches.match('/frontend/views/home.html');
            });
        })
    );
});

self.addEventListener('activate', function (event) {
    event.waitUntil(caches.keys().then(function (keys) {
        return Promise.all(keys.filter(k => k !== CACHE_NAME && k !== CACHE_API).map(k => caches.delete(k)))
    }));
});