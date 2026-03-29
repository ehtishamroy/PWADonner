'use client';

import { useEffect, useState } from 'react';
import { X, Share, Download } from 'lucide-react';
import { BRAND } from '@/lib/constants';

type Platform = 'ios' | 'android-chrome' | null;

// Detects which install path applies
function detectPlatform(): Platform {
    if (typeof window === 'undefined') return null;
    const ua = navigator.userAgent;
    const isIOS = /iphone|ipad|ipod/i.test(ua);
    const isSafari = /safari/i.test(ua) && !/chrome/i.test(ua);
    if (isIOS && isSafari) return 'ios';
    return null; // Android/Chrome handled via beforeinstallprompt event
}

// Check if already installed (running as standalone PWA)
function isInstalled(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(display-mode: standalone)').matches
        || (navigator as { standalone?: boolean }).standalone === true;
}

export function PWAInstallBanner() {
    const [platform, setPlatform]           = useState<Platform>(null);
    const [deferredPrompt, setDeferredPrompt] = useState<Event & { prompt: () => void } | null>(null);
    const [visible, setVisible]             = useState(false);
    const [dismissed, setDismissed]         = useState(false);

    useEffect(() => {
        // Don't show if already installed or already dismissed this session
        if (isInstalled()) return;
        if (sessionStorage.getItem('pwa-banner-dismissed')) return;

        const plt = detectPlatform();

        // iOS: show after a short delay
        if (plt === 'ios') {
            const t = setTimeout(() => { setPlatform('ios'); setVisible(true); }, 3000);
            return () => clearTimeout(t);
        }

        // Chrome/Android: listen for beforeinstallprompt
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as Event & { prompt: () => void });
            setPlatform('android-chrome');
            // Show banner after short delay
            setTimeout(() => setVisible(true), 3000);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    function handleDismiss() {
        setVisible(false);
        setDismissed(true);
        sessionStorage.setItem('pwa-banner-dismissed', '1');
    }

    async function handleInstall() {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        setVisible(false);
    }

    if (!visible || dismissed) return null;

    return (
        <div
            className="fixed bottom-24 left-4 right-4 z-50 rounded-[20px] shadow-2xl p-4 flex gap-3 items-start"
            style={{ backgroundColor: BRAND.greenDark, color: '#fff', maxWidth: '420px', margin: '0 auto' }}
        >
            {/* Icon */}
            <div className="w-10 h-10 rounded-[10px] shrink-0 overflow-hidden bg-white/20 flex items-center justify-center">
                <img src="/favicon.png" alt="App Icon" className="w-full h-full object-cover" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <p className="font-bold text-[13px] leading-tight mb-0.5"
                    style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                    App installieren
                </p>

                {platform === 'ios' ? (
                    <p className="text-[11px] opacity-80 leading-snug">
                        Tippe auf{' '}
                        <span className="inline-flex items-center gap-0.5 bg-white/20 rounded px-1">
                            <Share size={10} className="inline" /> Teilen
                        </span>
                        {' '}und dann{' '}
                        <strong>„Zum Home-Bildschirm"</strong>
                    </p>
                ) : (
                    <>
                        <p className="text-[11px] opacity-80 leading-snug mb-2">
                            Füge Wärme Schenken zum Startbildschirm hinzu für schnellen Zugriff.
                        </p>
                        <button
                            onClick={handleInstall}
                            className="flex items-center gap-1.5 bg-white text-[12px] font-bold px-3 py-1.5 rounded-full"
                            style={{ color: BRAND.greenDark }}>
                            <Download size={12} />
                            Jetzt installieren
                        </button>
                    </>
                )}
            </div>

            {/* Dismiss */}
            <button onClick={handleDismiss}
                className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                <X size={13} />
            </button>
        </div>
    );
}
