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
    // heic-decode loads libheif (WASM) at runtime; load it from node_modules
    // instead of bundling it.
    serverExternalPackages: ['fs', 'path', 'sharp', 'heic-decode', 'libheif-js'],

    // Uploaded photos/receipts are user data read from disk at runtime. Without
    // this, routes that build paths with process.cwd() make the build trace
    // every uploaded file, which gets slower as uploads grow.
    outputFileTracingExcludes: {
        '*': ['public/uploads/**', 'private-uploads/**'],
    },

    // Keep `next build` within the small VPS's memory (2 GB). See
    // node_modules/next/dist/docs/01-app/02-guides/memory-usage.md
    enablePrerenderSourceMaps: false,

    // Raise the body-size limit for all API routes to 10 MB so that
    // mobile photo uploads (HEIC, large JPEG etc.) are accepted.
    experimental: {
        serverActions: {
            bodySizeLimit: '10mb',
        },
        webpackMemoryOptimizations: true,
        serverSourceMaps: false,
        cpus: 1,
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
