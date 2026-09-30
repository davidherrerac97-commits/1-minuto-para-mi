import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Render app immediately so the UI is NEVER blocked or blank
const container = document.getElementById('root');
if (container) {
  createRoot(container).render(<App />);
}

// Safely register PWA service worker in background
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  import('virtual:pwa-register')
    .then(({ registerSW }) => {
      registerSW({ immediate: true });
    })
    .catch((err) => {
      // In development or when offline, fail silently
      console.warn('PWA Service Worker registration skipped:', err);
    });
}
