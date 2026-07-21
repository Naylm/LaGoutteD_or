self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let data = { title: 'Nouvelle commande', body: '' };
  try {
    data = event.data.json();
  } catch {
    if (event.data) data.body = event.data.text();
  }

  const title = data.title || 'Nouvelle commande';
  const options = {
    body: data.body || '',
    icon: '/icon.png',
    badge: '/icon.png',
    tag: 'lgo-order',
    renotify: true
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientsArr) => {
      const hadWindow = clientsArr.find(c => c.url.includes('/editeur'));
      if (hadWindow) return hadWindow.focus();
      return self.clients.openWindow('/editeur');
    })
  );
});
