'use client';

import Link from 'next/link';
import { BRAND } from '@/lib/constants';
import { LogOut } from 'lucide-react';

export function AdminHeader() {
    async function handleLogout() {
        await fetch('/api/admin/auth/logout', { method: 'POST' });
        window.location.href = '/admin/login';
    }

    return (
        <header className="bg-white border-b border-gray-100 flex items-center justify-between px-6 py-4 sticky top-0 z-50 shadow-sm">
            <div className="flex items-center gap-6">
                <Link href="/admin/dashboard" className="flex items-center gap-3 group">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: BRAND.green }}>
                        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="white"/>
                        </svg>
                    </div>
                    <div>
                        <h1 className="font-bold text-lg leading-tight uppercase tracking-wide" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                            Admin
                        </h1>
                        <p className="text-[10px] font-medium opacity-50 uppercase tracking-widest font-sans">
                            Wärme Schenken
                        </p>
                    </div>
                </Link>
                <div className="hidden md:flex items-center gap-4 ml-8 text-sm font-medium opacity-60">
                    <Link href="/admin/dashboard" className="hover:opacity-100 transition-opacity">Spenden prüfen</Link>
                </div>
            </div>

            <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm font-bold opacity-60 hover:opacity-100 transition-opacity"
                style={{ color: BRAND.error }}
            >
                <span className="hidden sm:inline">Abmelden</span>
                <LogOut size={16} />
            </button>
        </header>
    );
}
