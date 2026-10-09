// Anivora service worker
const VERSION = 'anivora-v1';
const SHELL = [
  './', './index.html', './manifest.json',
  './css/base.css', './css/components.css', './css/home.css', './css/explore.css',
  './css/detail.css', './css/watch.css', './css/profile.css', './css/responsive.css',
  './js/app.js', './js/core.js', './js/components.js', './js/data.js', './js/pages.js',
  './assets/avatars/logo.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(VERSION)
      .then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // ویدیو و درخواست‌های Range و سایت‌های دیگر: دست نزن
  if (req.headers.has('range') || url.origin !== self.location.origin) return;
  if (/\.(mkv|mp4|webm|m3u8|ts)$/i.test(url.pathname)) return;

  // دیتا: اول شبکه، اگه نبود کش
  if (url.pathname.endsWith('/data.json') || url.pathname.startsWith('/api/')) {
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(VERSION).then(c => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req))
    );
    return;
  }

  // بقیه (صفحه، css، js، عکس): اول شبکه، اگه نبود کش
  e.respondWith(
    fetch(req).then(res => {
      if (res.ok) {
        const copy = res.clone();
        caches.open(VERSION).then(c => c.put(req, copy));
      }
      return res;
    }).catch(() => caches.match(req).then(r => r || (req.mode === 'navigate' ? caches.match('./index.html') : undefined)))
  );
});
