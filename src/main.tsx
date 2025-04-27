
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Explicitly unregister any existing service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    for (let registration of registrations) {
      registration.unregister();
      console.log('Service worker unregistered');
    }
  });
}

createRoot(document.getElementById("root")!).render(<App />);
