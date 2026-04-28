'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/brand/Logo';
import { de } from '@/lib/i18n/de';

export default function SplashPage() {
    const router = useRouter();

    useEffect(() => {
        const t = setTimeout(() => router.replace('/welcome'), 2200);
        return () => clearTimeout(t);
    }, [router]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen" style={{ backgroundColor: '#F5F0EA' }}>
            <Logo size={180} animated />
            <h1
                className="mt-8 text-center"
                style={{
                    fontFamily:    "'Bricolage Grotesque', sans-serif",
                    fontWeight:    700,
                    fontSize:      '27px',
                    lineHeight:    '30px',
                    letterSpacing: '0.01em',
                }}
            >
                {de.splash.title.split('\n').map((line, i) => (
                    <span key={i}>{line}{i === 0 && <br />}</span>
                ))}
            </h1>
        </div>
    );
}
