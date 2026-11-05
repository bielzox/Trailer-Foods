// Service worker: deixa cardapio e admin instalaveis no celular e abrindo mesmo sem internet.
const V = 'trailer-foods-v21';
const ARQ = ['./', 'index.html', 'cardapio.js', 'supabase.js', 'config.js', 'manifest.webmanifest',
  'icone-192.png', 'icone-512.png', 'admin/admin.html', 'admin/admin.js', 'admin/manifest-admin.webmanifest'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => Promise.all(ARQ.map(a => c.add(a).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n !== V).map(n => caches.delete(n)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return; // Supabase/fontes passam direto
  e.respondWith(fetch(r).then(res => { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); return res; })
    .catch(() => caches.match(r, { ignoreSearch: true })));
});
