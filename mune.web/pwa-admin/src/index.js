import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker for PWA functionality
serviceWorkerRegistration.register({
  onUpdate: (registration) => {
    // Show alert or toast when new version is available
    const updateAlert = window.confirm(
      'A new version of the Rai Admin app is available. Would you like to update now?'
    );
    
    if (updateAlert) {
      // Force reload to activate the new service worker
      if (registration && registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
      window.location.reload();
    }
  },
  onSuccess: (registration) => {
    console.log('Service Worker registered successfully!');
    
    // Request notification permission if not already granted
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
    
    // Register for background sync
    if (registration.sync) {
      registration.sync.register('sync-order-status')
        .then(() => console.log('Background sync registered!'))
        .catch(err => console.error('Error registering background sync:', err));
    }
  }
});

// Track performance metrics
reportWebVitals(console.log);