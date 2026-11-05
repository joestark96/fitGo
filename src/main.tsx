import React from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

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
