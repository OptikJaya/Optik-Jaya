const CACHE_NAME = 'optik-jaya-cache-v2.0.4';
const VERSION = '2.0.4'; // Add version tracking
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

// Add message handling for version checking
self.addEventListener('message', event => {
    if (event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage(VERSION);
    }
});

// Enhanced fetch with network-first strategy and automatic update
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Clone the response because it can only be consumed once
                const responseToCache = response.clone();
                
                // Update the cache with the new response
                caches.open(CACHE_NAME)
                    .then(cache => {
                        cache.put(event.request, responseToCache);
                    });

                return response;
            })
            .catch(() => {
                // If network request fails, try to get from cache
                return caches.match(event.request);
            })
    );
});

// Cleanup old caches and notify clients of updates
self.addEventListener('activate', event => {
    event.waitUntil(
        Promise.all([
            // Clean up old caches
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== CACHE_NAME) {
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            // Notify all clients about the update
            clients.matchAll().then(clients => {
                clients.forEach(client => {
                    client.postMessage({
                        type: 'UPDATE_AVAILABLE',
                        version: VERSION
                    });
                });
            })
        ])
    );
    clients.claim(); // Take control of all open clients
});
