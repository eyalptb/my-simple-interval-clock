
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Force unregister all service workers before registering a new one
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    for (let registration of registrations) {
      registration.unregister();
      console.log('Service worker unregistered');
    }
    
    // After unregistering, register our updated service worker
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
