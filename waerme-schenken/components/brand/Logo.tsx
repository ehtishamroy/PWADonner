'use client';

import { BRAND } from '@/lib/constants';

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
            <svg
                width={size}
                height={Math.round(size * 0.92)}
                viewBox="0 0 100 92"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={animated ? 'logo-animated' : ''}
            >
                {/* Heart shape */}
                <path
                    d="M50 88.7C47.8 88.7 15 67.5 15 39.5C15 23.5 28.5 15 40 15C44.5 15 47.8 16.5 50 19.5C52.2 16.5 55.5 15 60 15C71.5 15 85 23.5 85 39.5C85 67.5 52.2 88.7 50 88.7Z"
                    fill={BRAND.green}
                />
                {/* Arms hugging */}
                <path
                    d="M38 55C38 55 42 59 50 59C58 59 62 55 62 55"
                    stroke="white"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                />
                <path d="M73 48L65 54" stroke="white" strokeWidth="2.8" strokeLinecap="round" />
                <path d="M27 48L35 54" stroke="white" strokeWidth="2.8" strokeLinecap="round" />
            </svg>
        </div>
    );
}
