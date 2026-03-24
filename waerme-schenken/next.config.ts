import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: '**.waerme-schenken.ch',
            },
        ],
        // Local uploads: served from /public so no config needed
    },
    // Needed for file system access in API routes on Vercel (disable edge runtime for upload route)
    serverExternalPackages: ['fs', 'path'],
};

export default nextConfig;
