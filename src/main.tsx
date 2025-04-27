
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      // First, unregister any existing service workers to ensure clean state
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
        console.info('ServiceWorker unregistered successfully');
      }
      
      // Register the service worker again
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      console.info('ServiceWorker registration successful with scope: ', registration.scope);
      
      // Check for updates to the service worker
      registration.update();
    } catch (err) {
      console.error('ServiceWorker registration failed: ', err);
    }
  });
}

createRoot(document.getElementById("root")!).render(<App />);
