
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      // Unregister any existing service workers first to ensure clean state
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (let registration of registrations) {
        await registration.unregister();
        console.log('ServiceWorker unregistered successfully');
      }
      
      // Register the service worker fresh
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
      
      // Force update to get the latest service worker
      await registration.update();
      console.log('ServiceWorker update triggered');
    } catch (err) {
      console.error('ServiceWorker registration failed: ', err);
    }
  });
}

createRoot(document.getElementById("root")!).render(<App />);
