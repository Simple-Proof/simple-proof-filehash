// This file should be imported in your main layout or entry point
// It ensures proper service worker registration with status updates

// Function to show a notification to the user
function showNotification(message) {
  // You can customize this to show a proper UI notification
  // For now, we'll just log to console
  console.log('PWA Status:', message);
}

// Register the service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');

      // When a new service worker is waiting
      if (registration.waiting) {
        showNotification('New version available! Refresh the page to update.');
      }

      // When a new service worker is found
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;

        // Track the state changes of the service worker
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            showNotification('New version available! Refresh the page to update.');
          }
        });
      });

      // Detect controller change (when the updated service worker takes over)
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });

      console.log('Service worker registered successfully!');
    } catch (error) {
      console.error('Service worker registration failed:', error);
    }
  });

  // Check if the app can work offline
  window.addEventListener('online', () => {
    showNotification('You are back online.');
  });

  window.addEventListener('offline', () => {
    showNotification('You are now offline. The app will continue to work with cached data.');
  });
}
