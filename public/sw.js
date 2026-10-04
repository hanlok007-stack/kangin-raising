// 서비스 워커: 한 번 연 뒤에는 오프라인에서도 실행된다.
// 페이지(index.html)는 새 버전을 먼저 받아 보고, 해시가 붙은 정적 파일은 캐시를 먼저 쓴다.
const CACHE = 'kangin-v4';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  const store = (res) => {
    if (res.ok) caches.open(CACHE).then((c) => c.put(req, res.clone()));
    return res;
  };
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).then(store).catch(() => caches.match(req).then((hit) => hit || caches.match('./'))));
    return;
  }
  event.respondWith(caches.match(req).then((hit) => hit || fetch(req).then(store)));
});
