const CACHE_NAME = 'optik-jaya-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/styles.css',  // If you have a CSS file
  '/scripts.js',  // If you have a JS file
  'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap',
  'https://i.imgur.com/ciEloG8.png'  // Your logo
];

// Install the service worker and cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Serve cached resources when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});
