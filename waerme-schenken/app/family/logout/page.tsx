'use client';

import { useEffect } from 'react';
import { Logo } from '@/components/brand/Logo';

export default function FamilyLogoutPage() {
    useEffect(() => {
        fetch('/api/auth/logout', { method: 'POST' }).finally(() => {
            window.location.href = '/family/login';
        });
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white">
            <Logo size={80} animated={true} />
            <p className="mt-6 text-sm opacity-50 font-medium font-sans">Abmelden...</p>
        </div>
    );
}
