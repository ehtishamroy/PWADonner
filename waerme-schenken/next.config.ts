import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: 'images.unsplash.com' },
            { protocol: 'https', hostname: '**.waerme-schenken.ch' },
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
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin',
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=()',
                    },
                    {
                        key: 'Strict-Transport-Security',
                        value: 'max-age=63072000; includeSubDomains',
                    },
                    {
                        key: 'Content-Security-Policy',
                        value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://images.unsplash.com https://*.waerme-schenken.ch; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none';",
                    },
                ],
            },
        ];
    },

};

export default nextConfig;
