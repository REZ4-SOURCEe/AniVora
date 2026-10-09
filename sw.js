const CACHE = 'anivora-v3';
const SHELL = ['./', 'index.html', 'manifest.json', 'assets/avatars/logo.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.all(SHELL.map((u) => c.add(u).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (req.headers.has('range')) return; // ویدیو رو دست نمیزنیم
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // فقط فایل‌های خود سایت
  if (/\.(mp4|mkv|webm|m3u8|ts)$/i.test(url.pathname)) return;

  const isStatic = /\.(png|jpe?g|webp|gif|svg|ico|woff2?)$/i.test(url.pathname);

  if (isStatic) {
    // عکس‌ها: اول کش
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
        return res;
      }))
    );
    return;
  }

  // صفحه، کد و دیتا: اول شبکه، اگه نبود کش
  e.respondWith(
    fetch(req).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      return res;
    }).catch(() =>
      caches.match(req).then((hit) => hit || (req.mode === 'navigate' ? caches.match('index.html') : Response.error()))
    )
  );
});
