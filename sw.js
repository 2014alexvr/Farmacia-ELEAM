// Service Worker disabled to prevent 403 Forbidden errors on hosting.
// This file is intentionally left inert.

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  self.clients.claim();
});

// No fetch listener to avoid intercepting network requests.