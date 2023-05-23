// Service Worker 설치
self.addEventListener('install', function(event) {
    event.waitUntil(
      caches.open('my-cache').then(function(cache) {
        return cache.addAll([
          // 캐싱할 파일 경로
          '/',
          '/index.html',
          '/styles.css',
          '/script.js'
        ]);
      })
    );
  });
  
  // 캐싱된 콘텐츠 사용
  self.addEventListener('fetch', function(event) {
    event.respondWith(
      caches.match(event.request).then(function(response) {
        return response || fetch(event.request);
      })
    );
  });
  
  // 오프라인 상태에서 나타낼 페이지 설정
  self.addEventListener('fetch', function(event) {
    event.respondWith(
      fetch(event.request).catch(function() {
        return caches.match('/offline.html');
      })
    );
  });
  