
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Removed service worker registration code entirely

createRoot(document.getElementById("root")!).render(<App />);
