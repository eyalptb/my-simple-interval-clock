
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Immediately unregister any service workers to prevent caching issues
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    for (let registration of registrations) {
      registration.unregister();
      console.log('Service worker unregistered');
    }
  });
}

createRoot(document.getElementById("root")!).render(<App />);
