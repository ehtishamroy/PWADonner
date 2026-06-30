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
        // Optimize uploaded images in all environments for performance at scale
        unoptimized: false,
        // Resize images to smaller sizes for thumbnails
        deviceSizes: [640, 750, 828, 1080, 1200],
        imageSizes: [64, 128, 256, 384],
    },
    serverExternalPackages: ['fs', 'path'],

    // Raise the body-size limit for all API routes to 10 MB so that
    // mobile photo uploads (HEIC, large JPEG etc.) are accepted.
    experimental: {
        serverActions: {
            bodySizeLimit: '10mb',
        },
    },

    // Prevent browsers / CDNs from caching HTML responses.
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
