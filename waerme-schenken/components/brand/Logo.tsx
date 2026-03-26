'use client';

import { BRAND } from '@/lib/constants';
import Image from 'next/image';

interface LogoProps {
    size?: number;
    animated?: boolean;
}

export function Logo({ size = 80, animated = false }: LogoProps) {
    return (
        <div className="relative inline-block">
            {animated && (
                <style>{`
                    @keyframes heartbeat {
                        0%, 100% { transform: scale(1); }
                        50% { transform: scale(1.06); }
                    }
                    .logo-animated { animation: heartbeat 2s ease-in-out infinite; transform-origin: center; }
                `}</style>
            )}
            <div 
                className={animated ? 'logo-animated' : ''}
                style={{ width: size, height: Math.round(size * 0.92), position: 'relative' }}
            >
                <Image
                    src="/images/logo.png"
                    alt="Wärme schenken Logo"
                    fill
                    className="object-contain"
                    unoptimized
                />
            </div>
        </div>
    );
}
