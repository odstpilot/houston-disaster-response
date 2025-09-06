// Service Worker for Houston Disaster Response App
const CACHE_NAME = 'houston-disaster-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/config.js',
  '/js/api.js',
  '/js/map.js',
  '/js/chat.js',
  '/js/profile.js',
  '/js/checklist.js',
  '/js/notifications.js',
  '/js/disasters.js',
  '/js/app.js',
  '/manifest.json',
  'https://cdn.tailwindcss.com',
  // Google Maps API loaded dynamically
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css'
];

// Critical offline data
const OFFLINE_DATA = {
  emergencyContacts: {
    'Emergency': '911',
    'Non-Emergency': '713-884-3131',
    'Houston 311': '311',
    'Red Cross': '713-526-8300',
    'FEMA': '1-800-621-3362',
    'Poison Control': '1-800-222-1222'
  },
  evacuationZones: {
    'A': 'Coastal areas - Evacuate for ALL hurricanes',
    'B': 'Near coast - Evacuate for Category 3+ storms',
    'C': 'Inland - Evacuate for Category 4+ storms'
  },
  shelters: [
    {
      name: 'George R. Brown Convention Center',
      address: '1001 Avenida De Las Americas, Houston, TX',
      phone: '713-853-8000'
    },
    {
      name: 'NRG Center',
      address: '1 NRG Park, Houston, TX',
      phone: '832-667-1400'
    },
    {
      name: 'Toyota Center',
      address: '1510 Polk St, Houston, TX',
      phone: '713-758-7200'
    }
  ]
};

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(response => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type === 'opaque') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Cache the response for future use
          caches.open(CACHE_NAME)
            .then(cache => {
              // Only cache same-origin and CORS-enabled resources
              if (event.request.url.startsWith(self.location.origin) ||
                  event.request.url.includes('cdn.') ||
                  event.request.url.includes('unpkg.com')) {
                cache.put(event.request, responseToCache);
              }
            });

          return response;
        }).catch(() => {
          // Offline fallback
          return handleOfflineRequest(event.request);
        });
      })
  );
});

// Handle offline requests
function handleOfflineRequest(request) {
  const url = new URL(request.url);
  
  // API fallbacks
  if (url.pathname.includes('/api/')) {
    return new Response(JSON.stringify({
      offline: true,
      data: OFFLINE_DATA,
      message: 'You are offline. Showing cached data.'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Default offline page
  return caches.match('/index.html');
}

// Push event - handle push notifications
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'Emergency Alert',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'view',
        title: 'View Alert',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/xmark.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Houston Disaster Alert', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'view') {
    // Open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Background sync for offline actions
self.addEventListener('sync', event => {
  if (event.tag === 'sync-checklist') {
    event.waitUntil(syncChecklist());
  } else if (event.tag === 'sync-profile') {
    event.waitUntil(syncProfile());
  }
});

async function syncChecklist() {
  try {
    // Get cached checklist data
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match('/checklist-data');
    
    if (response) {
      const data = await response.json();
      // Send to server when online
      await fetch('/api/checklist', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Sync failed:', error);
    throw error;
  }
}

async function syncProfile() {
  try {
    // Similar to syncChecklist
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match('/profile-data');
    
    if (response) {
      const data = await response.json();
      await fetch('/api/profile', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Profile sync failed:', error);
    throw error;
  }
}

// Message event - communicate with main app
self.addEventListener('message', event => {
  if (event.data.type === 'CHECK_UPDATE') {
    checkForUpdates();
  } else if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

function checkForUpdates() {
  // Check for app updates
  fetch('/version.json')
    .then(response => response.json())
    .then(data => {
      // Compare versions and notify if update available
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'UPDATE_AVAILABLE',
            version: data.version
          });
        });
      });
    })
    .catch(error => console.error('Update check failed:', error));
}

// Periodic background sync
self.addEventListener('periodicsync', event => {
  if (event.tag === 'check-alerts') {
    event.waitUntil(checkForAlerts());
  }
});

async function checkForAlerts() {
  try {
    // Fetch latest alerts
    const response = await fetch('/api/alerts');
    const alerts = await response.json();
    
    // Show notification for critical alerts
    if (alerts.critical) {
      self.registration.showNotification('Critical Alert', {
        body: alerts.message,
        icon: '/icons/alert.png',
        badge: '/icons/badge.png',
        requireInteraction: true
      });
    }
  } catch (error) {
    console.error('Alert check failed:', error);
  }
}
