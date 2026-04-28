'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegistration() {
    useEffect(() => {
        if (!('serviceWorker' in navigator)) return;

        navigator.serviceWorker
            .register('/sw.js')
            .then((reg) => {
                console.log('[SW] Registered:', reg.scope);
                // Check for updates every 60 s
                setInterval(() => reg.update(), 60_000);
            })
            .catch((err) => console.warn('[SW] Registration failed:', err));

        // When a new SW takes over, reload once to ensure fresh content
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (refreshing) return;
            refreshing = true;
            window.location.reload();
        });
    }, []);

    return null;
}
