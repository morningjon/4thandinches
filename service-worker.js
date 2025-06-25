const CACHE_NAME = 'draft-kicker-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/main.js',
  '/manifest.json',
    '/cheer.mp3',
    '/boo.mp3'
];

self.addEventListener('install', evt => {
  evt.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('fetch', evt => {
  evt.respondWith(
    caches.match(evt.request).then(res => res || fetch(evt.request))
  );
});


