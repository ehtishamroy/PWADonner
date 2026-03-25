import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title:       'Wärme schenken',
    description: 'Freude weitergeben — Spielzeug spenden für Familien in Not.',
    manifest:    '/manifest.json',
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
    themeColor:          '#537D61',
    width:               'device-width',
    initialScale:        1,
    maximumScale:        1,
    userScalable:        false,
    viewportFit:         'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="de">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,700&family=Inter:wght@400;500;700&display=swap"
                    rel="stylesheet"
                />
                <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
            </head>
            <body className="antialiased" suppressHydrationWarning>
                {children}
            </body>
        </html>
    );
}
