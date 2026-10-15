/* Parlor service worker: keeps the games available offline.
   Pages and files: network first (so updates show up), cached copy when offline. */
const CACHE = 'parlor-4132672946';
const FILES = ["./", "index.html", "manifest.webmanifest", "config.js", "shim.js", "lib/firebase-app-compat.js", "lib/firebase-database-compat.js", "icons/atoll-180.png", "icons/atoll-192.png", "icons/atoll-512.png", "icons/furrow-180.png", "icons/furrow-192.png", "icons/furrow-512.png", "icons/parlor-180.png", "icons/parlor-192.png", "icons/parlor-512.png", "icons/setback-180.png", "icons/setback-192.png", "icons/setback-512.png", "icons/spades-180.png", "icons/spades-192.png", "icons/spades-512.png", "icons/strand-180.png", "icons/strand-192.png", "icons/strand-512.png", "icons/tempo-180.png", "icons/tempo-192.png", "icons/tempo-512.png", "tempo/", "tempo/manifest.webmanifest", "strand/", "strand/manifest.webmanifest", "furrow/", "furrow/manifest.webmanifest", "atoll/", "atoll/manifest.webmanifest", "spades/", "spades/manifest.webmanifest", "setback/", "setback/manifest.webmanifest"];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(FILES.map(f => c.add(f).catch(() => null)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('parlor-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const same = url.origin === self.location.origin;
  const fonts = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (!same && !fonts) return; // live game traffic goes straight to the network
  e.respondWith(
    fetch(req).then(res => {
      if (res && (res.ok || res.type === 'opaque')) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {}); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || (req.mode === 'navigate' ? caches.match('./') : undefined)))
  );
});
