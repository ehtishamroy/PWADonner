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
};

export default nextConfig;
