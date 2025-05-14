// サービスワーカーのインストール
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('keirin-racer-cache-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/style.css',
        '/app.js',
        '/manifest.json',
        '/icons/keirin-icon-192x192.png',
        '/icons/keirin-icon-512x512.png',
      ]);
    })
  );
});

// サービスワーカーのアクティベート
self.addEventListener('activate', (event) => {
  const cacheWhitelist = ['keirin-racer-cache-v1'];
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
});

// フェッチイベント
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // ネットワークから取得できたらキャッシュにも保存
        return caches.open('keirin-racer-cache-v1').then((cache) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
      .catch(() => {
        // ネットワークがだめならキャッシュを返す
        return caches.match(event.request);
      })
  );
});

