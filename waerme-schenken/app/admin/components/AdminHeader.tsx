'use client';

import Link from 'next/link';
import { BRAND } from '@/lib/constants';
import { LogOut } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';

export function AdminHeader() {
    async function handleLogout() {
        await fetch('/api/admin/auth/logout', { method: 'POST' });
        window.location.href = '/admin/login';
    }

    return (
        <header className="bg-white border-b border-gray-100 flex items-center justify-between px-6 py-4 sticky top-0 z-50 shadow-sm">
            <div className="flex items-center gap-6">
                <Link href="/admin/dashboard" className="flex items-center gap-3 group">
                    <div className="shrink-0 flex items-center justify-center">
                        <Logo size={32} animated={false} />
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
                    <Link href="/admin/users" className="hover:opacity-100 transition-opacity">Nutzer</Link>
                    <Link href="/admin/settings/images" className="hover:opacity-100 transition-opacity">Einstellungen</Link>
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
