'use client';

import { useEffect } from 'react';

/**
 * Registers the service worker for offline support. Only runs in production:
 * dev builds change too often, and registering SW in dev confuses HMR.
 */
export function ServiceWorker() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;
    if (process.env.NODE_ENV !== 'production') return;

    const onLoad = () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .catch((err) => {
          // Don't surface to user; offline is best-effort
          console.warn('SW registration failed', err);
        });
    };
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);
  return null;
}
