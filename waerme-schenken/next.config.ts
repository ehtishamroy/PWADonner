import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: 'images.unsplash.com' },
            { protocol: 'https', hostname: '**.waerme-schenken.ch' },
            // Development local server
            { protocol: 'http', hostname: 'localhost' },
            { protocol: 'http', hostname: '127.0.0.1' },
        ],
        // Images stored in /public are served statically — no remotePattern needed
        // For uploaded images: use unoptimized if served from VPS directly
        unoptimized: process.env.NODE_ENV === 'development',
    },
    serverExternalPackages: ['fs', 'path'],

    // Prevent browsers / CDNs from caching HTML responses.
    // After a deploy the page shell must always be re-fetched so that the
    // correct hashed JS/CSS chunk URLs are sent to the client.
    async headers() {
        return [
            {
                source: '/((?!_next/static|_next/image|icons|images|uploads|favicon).*)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'no-store, must-revalidate',
                    },
                ],
            },
        ];
    },

};

export default nextConfig;

