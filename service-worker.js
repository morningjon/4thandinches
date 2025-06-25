const cacheName = 'draft-kicker-v1';
const filesToCache = [
    './',
    './index.html',
    './style.css',
    './main.js',
    './manifest.json',
    './assets/cheer.mp3',
    './assets/boo.mp3'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(cacheName).then(cache => {
            return cache.addAll(filesToCache);
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});
