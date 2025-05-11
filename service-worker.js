
self.addEventListener('install', event => {
  console.log('Service worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('Service worker activated');
});

self.addEventListener('message', function(event) {
  const data = event.data;
  if (data && data.type === 'scheduleNotification') {
    const delay = data.timestamp - Date.now();
    if (delay > 0) {
      setTimeout(() => {
        self.registration.showNotification("Koncert snart!", {
          body: `🎤 ${data.artist} spiller om 14 minutter på ${data.scene}!`
        });
      }, delay);
    }
  }
});
