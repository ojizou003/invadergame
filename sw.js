const CACHE_NAME = 'space-invaders-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/src/main.ts',
  '/src/game/Game.ts',
  '/src/game/Player.ts',
  '/src/game/Invader.ts',
  '/src/game/InvaderGrid.ts',
  '/src/game/Bullet.ts',
  '/src/game/UFO.ts',
  '/src/game/Barrier.ts',
  '/src/game/Explosion.ts',
  '/src/game/ScoreDisplay.ts',
  '/src/game/ScorePopup.ts',
  '/src/audio/SoundEngine.ts',
  '/src/graphics/Renderer.ts',
  '/src/graphics/Sprite.ts',
  '/src/input/InputManager.ts',
  '/src/input/Controls.ts',
  '/src/utils/Vector2.ts',
  '/src/utils/Rectangle.ts',
  '/src/utils/Constants.ts',
  '/OpenCode.md', // 開発中は含める
  '/manifest.json'
  // TODO: スプライト画像やサウンドファイルなどもキャッシュ対象に追加
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        // No cache match - fetch from network
        return fetch(event.request);
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});