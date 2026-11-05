import React from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';
import { StorageService } from './services/storage';

const container = document.getElementById('root');
const root = createRoot(container!);

// Render immediately to prevent any blank/black screen
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Initialize SQLite in the background without blocking UI rendering
StorageService.init().catch((err) => {
  console.warn('[FitTrack] Background storage init note:', err);
});

// Register PWA Service Worker in production web environments
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./sw.js')
      .then((reg) => {
        console.log('FitTrack PWA ServiceWorker registered with scope:', reg.scope);
      })
      .catch((err) => {
        console.warn('FitTrack PWA ServiceWorker registration failed:', err);
      });
  });
}
