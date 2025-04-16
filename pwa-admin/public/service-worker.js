/* eslint-disable no-restricted-globals */

// This service worker can be customized!
// See https://developers.google.com/web/tools/workbox/modules
// for the list of available Workbox modules, or add any other
// code you'd like.

// Constants
const CACHE_NAME = 'rai-admin-cache-v1';
const DATA_CACHE_NAME = 'rai-admin-data-cache-v1';
const ASSETS_TO_CACHE = [
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

// Install event: cache assets
self.addEventListener('install', (event) => {
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
});

// Activate event: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== DATA_CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
          return null;
        })
      );
    })
  );
  
  // Claim any clients immediately
  event.waitUntil(self.clients.claim());
});

// Fetch event: network-first strategy for API calls, cache-first for assets
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/')) {
    // Network-first strategy for API calls
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone response for caching
          const responseToCache = response.clone();
          
          caches.open(DATA_CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        })
        .catch(() => {
          // If network request fails, try to get from cache
          return caches.match(event.request);
        })
    );
  } else {
    // Cache-first strategy for static assets
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          return response || fetch(event.request)
            .then((fetchResponse) => {
              // Don't cache non-GET responses
              if (event.request.method !== 'GET') {
                return fetchResponse;
              }
              
              // Cache the fetched response
              const responseToCache = fetchResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
              
              return fetchResponse;
            });
        })
        .catch((error) => {
          console.error('Fetch failed:', error);
          
          // For HTML navigation, return the offline page if available
          if (event.request.mode === 'navigate') {
            return caches.match('/offline.html')
              .then((response) => {
                return response || new Response('You are offline and the offline page is not available.', {
                  headers: { 'Content-Type': 'text/html' }
                });
              });
          }
          
          // For images, return a placeholder
          if (event.request.destination === 'image') {
            return new Response(null, { status: 404 });
          }
        })
    );
  }
});

// Background sync for order status updates
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-order-status') {
    event.waitUntil(syncOrderStatus());
  }
});

// Periodic background sync for checking new orders
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'regular-check-orders') {
    event.waitUntil(checkForNewOrders());
  }
});

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('Push received:', event);
  
  if (event.data) {
    const data = event.data.json();
    
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: data.icon || '/logo192.png',
        badge: data.badge || '/logo192.png',
        vibrate: data.vibrate || [200, 100, 200, 100, 200],
        tag: data.tag,
        data: data.data || {},
        requireInteraction: data.requireInteraction || true,
        renotify: data.renotify || true,
        actions: data.actions || [
          { action: 'view', title: 'View' }
        ]
      })
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received:', event);
  event.notification.close();
  
  // Get data from notification
  const data = event.notification.data || {};
  
  let urlToOpen = '/';
  
  // Determine URL based on notification or action
  if (event.action === 'view' && data.orderId) {
    urlToOpen = `/orders/${data.orderId}`;
  } else if (data.orderId) {
    urlToOpen = `/orders/${data.orderId}`;
  } else if (data.url) {
    urlToOpen = data.url;
  }
  
  // Open URL
  event.waitUntil(
    self.clients.matchAll({ type: 'window' })
      .then((clientList) => {
        // If a window client is already open, focus it and navigate
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.focus();
            client.navigate(urlToOpen);
            return;
          }
        }
        
        // Otherwise open a new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      })
  );
});

// Helper function to sync order status updates
async function syncOrderStatus() {
  try {
    // Open the IndexedDB database
    const db = await openDatabase();
    
    // Get pending status updates
    const transaction = db.transaction(['orderStatusUpdates'], 'readonly');
    const store = transaction.objectStore('orderStatusUpdates');
    const pendingUpdates = await getAll(store);
    
    if (pendingUpdates.length === 0) {
      console.log('No pending order status updates to sync');
      return;
    }
    
    console.log('Syncing order status updates:', pendingUpdates);
    
    // Get auth data
    const authData = await getAuthDataFromIndexedDB();
    
    if (!authData || !authData.userId || !authData.serverUrl) {
      console.error('Cannot sync without authentication data');
      return;
    }
    
    // Process each update
    const successfulUpdates = [];
    
    for (const update of pendingUpdates) {
      try {
        const response = await fetch(`${authData.serverUrl}/api/orders/${update.orderId}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'X-User-ID': authData.userId
          },
          body: JSON.stringify({
            status: update.status,
            settled: update.settled,
            restaurantPaid: update.restaurantPaid
          })
        });
        
        if (response.ok) {
          successfulUpdates.push(update.id);
        } else {
          console.error('Failed to sync order status update:', response.statusText);
        }
      } catch (err) {
        console.error('Error syncing order status update:', err);
      }
    }
    
    // Remove successful updates from the store
    if (successfulUpdates.length > 0) {
      const deleteTransaction = db.transaction(['orderStatusUpdates'], 'readwrite');
      const deleteStore = deleteTransaction.objectStore('orderStatusUpdates');
      
      for (const id of successfulUpdates) {
        deleteStore.delete(id);
      }
      
      console.log(`Removed ${successfulUpdates.length} synced updates`);
    }
  } catch (error) {
    console.error('Error in syncOrderStatus:', error);
  }
}

// Helper function to check for new orders
async function checkForNewOrders() {
  try {
    // Get auth data
    const authData = await getAuthDataFromIndexedDB();
    
    if (!authData || !authData.userId || !authData.serverUrl) {
      console.error('Cannot check for new orders without authentication data');
      return;
    }
    
    // Get the last check time
    const lastCheckTime = localStorage.getItem('lastCheckTime') || new Date(0).toISOString();
    
    // Fetch new orders
    const response = await fetch(`${authData.serverUrl}/api/orders/new?since=${lastCheckTime}`, {
      headers: {
        'X-User-ID': authData.userId
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch new orders');
    }
    
    const newOrders = await response.json();
    
    if (newOrders.length > 0) {
      console.log(`Found ${newOrders.length} new orders`);
      
      // Show notification for each new order
      for (const order of newOrders) {
        self.registration.showNotification('New Order Received!', {
          body: `Order #${order.id} from ${order.name || 'Room ' + order.roomNumber}`,
          icon: '/logo192.png',
          badge: '/logo192.png',
          vibrate: [200, 100, 200, 100, 200, 100, 400],
          tag: `new-order-${order.id}`,
          data: { orderId: order.id },
          actions: [
            {
              action: 'view',
              title: 'View',
            }
          ],
          requireInteraction: true,
          renotify: true
        });
      }
    }
    
    // Update last check time
    localStorage.setItem('lastCheckTime', new Date().toISOString());
  } catch (error) {
    console.error('Error checking for new orders:', error);
  }
}

// Helper function to get auth data from IndexedDB
async function getAuthDataFromIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('rai-admin-db', 1);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('auth')) {
        db.createObjectStore('auth', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('orderStatusUpdates')) {
        const store = db.createObjectStore('orderStatusUpdates', { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        store.createIndex('orderId', 'orderId', { unique: false });
      }
    };
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      
      try {
        const transaction = db.transaction(['auth'], 'readonly');
        const store = transaction.objectStore('auth');
        const getRequest = store.get('auth-data');
        
        getRequest.onsuccess = () => {
          resolve(getRequest.result || null);
        };
        
        getRequest.onerror = () => {
          resolve(null);
        };
      } catch (err) {
        console.error('Error reading auth data:', err);
        resolve(null);
      }
    };
    
    request.onerror = () => {
      console.error('Error opening database');
      resolve(null);
    };
  });
}

// Helper function to open IndexedDB
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('rai-admin-db', 1);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('auth')) {
        db.createObjectStore('auth', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('orderStatusUpdates')) {
        const store = db.createObjectStore('orderStatusUpdates', { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        store.createIndex('orderId', 'orderId', { unique: false });
      }
    };
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Helper function to get all items from an object store
function getAll(store) {
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}