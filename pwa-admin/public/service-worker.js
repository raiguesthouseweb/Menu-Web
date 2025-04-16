/* eslint-disable no-restricted-globals */

// This service worker can be customized
// See https://developers.google.com/web/tools/workbox/modules
// for the list of available Workbox modules

const CACHE_NAME = 'rai-admin-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/main.chunk.js',
  '/static/js/0.chunk.js',
  '/static/js/bundle.js',
  '/manifest.json',
  '/logo192.png',
  '/logo512.png',
  '/favicon.ico',
  '/static/media/notification.wav'
];

// Install a service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Cache and return requests
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then(response => {
          // Don't cache API calls
          if (
            !response || 
            response.status !== 200 || 
            response.type !== 'basic' ||
            event.request.url.includes('/api/')
          ) {
            return response;
          }

          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return response;
        });
      })
    );
  }
});

// Update a service worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
          return null;
        })
      );
    })
  );
  self.clients.claim();
});

// Background sync for network requests that failed
self.addEventListener('sync', event => {
  if (event.tag === 'updateOrderStatus') {
    event.waitUntil(syncOrderStatus());
  }
  if (event.tag === 'checkNewOrders') {
    event.waitUntil(checkForNewOrders());
  }
});

// Background periodic sync for checking new orders regularly
self.addEventListener('periodicsync', event => {
  if (event.tag === 'regular-check-orders') {
    event.waitUntil(checkForNewOrders());
  }
});

// Process push notifications
self.addEventListener('push', event => {
  let data = { title: 'New Notification', body: 'New activity in Rai Admin' };
  
  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (error) {
    console.error('Error parsing push data:', error);
  }
  
  const options = {
    body: data.body,
    icon: '/logo192.png',
    badge: '/logo192.png',
    vibrate: [200, 100, 200, 100, 200, 100, 400],
    sound: '/static/media/notification.wav',
    tag: data.tag || 'rai-admin-notification',
    data: data.data || {},
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/icons/view.png'
      }
    ],
    renotify: true
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification click events
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  let url = '/orders';
  
  if (event.action === 'view' && event.notification.data.orderId) {
    url = `/orders/${event.notification.data.orderId}`;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(windowClients => {
      // Check if there's already a window open
      for (const client of windowClients) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, open a new window
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Function to sync order status
async function syncOrderStatus() {
  try {
    const pendingRequestsStr = await self.caches.match('pending-requests');
    if (!pendingRequestsStr) return;
    
    const pendingRequests = JSON.parse(pendingRequestsStr);
    
    for (const request of pendingRequests) {
      try {
        const response = await fetch(request.url, {
          method: request.method,
          headers: request.headers,
          body: JSON.stringify(request.body)
        });
        
        if (response.ok) {
          // Remove from pending requests
          const updatedRequests = pendingRequests.filter(r => 
            r.url !== request.url || r.body?.id !== request.body?.id
          );
          
          await caches.open(CACHE_NAME).then(cache => {
            cache.put('pending-requests', new Response(JSON.stringify(updatedRequests)));
          });
        }
      } catch (error) {
        console.error('Error syncing request:', error);
      }
    }
  } catch (error) {
    console.error('Error in syncOrderStatus:', error);
  }
}

// Function to check for new orders
async function checkForNewOrders() {
  try {
    // Get server URL and authentication from IndexedDB
    const authData = await getAuthDataFromIndexedDB();
    if (!authData || !authData.serverUrl || !authData.userId) {
      console.log('No auth data available for background sync');
      return;
    }
    
    const response = await fetch(`${authData.serverUrl}/api/orders`, {
      headers: {
        'X-User-ID': authData.userId
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch orders: ${response.status}`);
    }
    
    const orders = await response.json();
    
    // Check for new orders since last check
    const lastCheck = localStorage.getItem('lastOrderCheck') 
      ? new Date(localStorage.getItem('lastOrderCheck')) 
      : new Date(0);
      
    const newOrders = orders.filter(order => {
      const orderDate = new Date(order.timestamp);
      return orderDate > lastCheck;
    });
    
    // Show notifications for new orders
    if (newOrders.length > 0) {
      for (const order of newOrders) {
        await self.registration.showNotification('New Order Received!', {
          body: `Order #${order.id} from ${order.name || 'Room ' + order.roomNumber}`,
          icon: '/logo192.png',
          badge: '/logo192.png',
          vibrate: [200, 100, 200, 100, 200, 100, 400],
          sound: '/static/media/notification.wav',
          tag: `new-order-${order.id}`,
          data: { orderId: order.id },
          actions: [
            {
              action: 'view',
              title: 'View Order',
              icon: '/icons/view.png'
            }
          ],
          renotify: true
        });
      }
      
      // Play notification sound
      // Note: This may not work in all browsers due to autoplay restrictions
      const audioContext = new AudioContext();
      fetch('/static/media/notification.wav')
        .then(response => response.arrayBuffer())
        .then(buffer => audioContext.decodeAudioData(buffer))
        .then(decodedData => {
          const source = audioContext.createBufferSource();
          source.buffer = decodedData;
          source.connect(audioContext.destination);
          source.start(0);
        })
        .catch(error => console.error('Error playing notification sound:', error));
    }
    
    // Update last check time
    localStorage.setItem('lastOrderCheck', new Date().toISOString());
    
  } catch (error) {
    console.error('Error checking for new orders:', error);
  }
}

// Helper function to get auth data from IndexedDB
async function getAuthDataFromIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('rai-admin-db', 1);
    
    request.onerror = event => {
      reject('Error opening IndexedDB');
    };
    
    request.onsuccess = event => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('auth')) {
        reject('Auth store not found');
        return;
      }
      
      const transaction = db.transaction(['auth'], 'readonly');
      const store = transaction.objectStore('auth');
      const authDataRequest = store.get('auth-data');
      
      authDataRequest.onsuccess = event => {
        resolve(authDataRequest.result);
      };
      
      authDataRequest.onerror = event => {
        reject('Error fetching auth data');
      };
    };
  });
}