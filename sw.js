var cacheName = 'phaser-v4';
var filesToCache = [
  '/',
  '/favicon.ico',
  '/index.html',
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return cache.addAll(filesToCache);
    }).catch(function(err) {
      console.log(err);
    })
  );
});

self.addEventListener('fetch', function(event) {
  console.log('Service Worker Fetch...');

  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if(response){
          console.log('Serve from cache', response);
          return response;
        }
        return fetch(event.request)
            .then(response =>
              caches.open(cacheName.prefetch)
                .then((cache) => {
                  // cache response after making a request
                  cache.put(event.request, response.clone());
                  // return original response
                  return response;
                })
            )
    })
  )
})

self.addEventListener('activate', function(event) {
  console.log('sw activate');
  event.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key !== cacheName) {
          console.log('sw removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
});
