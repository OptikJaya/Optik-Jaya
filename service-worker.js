const CACHE_NAME = 'optik-jaya-cache-v1';
const urlsToCache = [
    './',
    './index.html',
    '/manifest.json',
    '/styles.css',
    '/scripts.js',
    './icon1.png',
    './icon2.png'
];

// Install service worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
    self.skipWaiting(); // Force new service worker to activate immediately
});

// Fetch resources
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request);
            })
    );
});

// Update the service worker and delete old caches if any
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    clients.claim(); // Take control of all open clients immediately
});
