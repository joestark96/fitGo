import React from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';
import { StorageService } from './services/storage';

const bootApp = async () => {
  try {
    await StorageService.init();
  } catch (err) {
    console.warn('[FitTrack] Storage init note:', err);
  }

  const container = document.getElementById('root');
  const root = createRoot(container!);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
};

bootApp();

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
