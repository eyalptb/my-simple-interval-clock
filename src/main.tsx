
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Import favicon assets so Vite processes them
import './assets/favicon';

createRoot(document.getElementById("root")!).render(<App />);
