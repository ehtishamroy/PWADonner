import type { Metadata, Viewport } from 'next';
import './globals.css';
import fs from 'fs';
import path from 'path';
import { ServiceWorkerRegistration } from '@/components/ui/ServiceWorkerRegistration';
import { PWAInstallBanner } from '@/components/ui/PWAInstallBanner';
import { Suspense } from 'react';

// Get cache-busting timestamp based on physical file modification time
let iconVersion = '1';
try {
    const stat = fs.statSync(path.join(process.cwd(), 'public/favicon.png'));
    iconVersion = stat.mtimeMs.toString();
} catch (e) {}

export const metadata: Metadata = {
    title:       'Wärme schenken',
    description: 'Freude weitergeben — Spielzeug spenden für Familien in Not.',
    manifest:    '/manifest.json', // manifest cannot easily take query strings without breaking on some devices
    icons: {
        icon: `/favicon.png?v=${iconVersion}`,
        apple: `/icons/apple-touch-icon.png?v=${iconVersion}`,
    },
    appleWebApp: {
        capable:         true,
        statusBarStyle:  'default',
        title:           'Wärme schenken',
    },
    openGraph: {
        title:       'Wärme schenken',
        description: 'Gemeinsam Freude schenken.',
        type:        'website',
    },
};

export const viewport: Viewport = {
    themeColor:          '#F5F0EA',
    width:               'device-width',
    initialScale:        1,
    maximumScale:        1,
    userScalable:        false,
    viewportFit:         'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="de" suppressHydrationWarning style={{ backgroundColor: '#F5F0EA' }}>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,700&family=Inter:wght@400;500;700&display=swap"
                    rel="stylesheet"
                />
                <link rel="apple-touch-icon" href={`/icons/apple-touch-icon.png?v=${iconVersion}`} />
            </head>
            <body className="antialiased" suppressHydrationWarning style={{ backgroundColor: '#F5F0EA' }}>
                <ServiceWorkerRegistration />
                <Suspense fallback={null}>
                    <PWAInstallBanner />
                </Suspense>
                {children}
            </body>
        </html>
    );
}
