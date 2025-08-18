const CACHE_NAME = 'fireinsmoke-v1';
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/assets/css/styles.css',
  '/assets/js/main.js',
  '/assets/data/menu.json',
  '/assets/data/partners.json',
  '/image0.jpg'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(CORE_ASSETS)));
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k!==CACHE_NAME).map(k => caches.delete(k))))
  );
});
self.addEventListener('fetch', e => {
  const { request } = e;
  if(request.method !== 'GET') return;
  e.respondWith(
    caches.match(request).then(cached => {
      if(cached) return cached;
      return fetch(request).then(resp => {
        const copy = resp.clone();
        if(copy.ok && copy.type === 'basic'){
          caches.open(CACHE_NAME).then(c => c.put(request, copy));
        }
        return resp;
      }).catch(()=> caches.match('/offline.html'));
    })
  );
});
