'use client';

import Link from 'next/link';
import { BRAND } from '@/lib/constants';
import { LogOut, Menu, X } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { useState } from 'react';

export function AdminHeader() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    async function handleLogout() {
        await fetch('/api/admin/auth/logout', { method: 'POST' });
        window.location.href = '/admin/login';
    }

    const navLinks = [
        { href: "/admin/dashboard", label: "Spenden prüfen" },
        { href: "/admin/families", label: "Familien" },
        { href: "/admin/banner", label: "Banner" },
        { href: "/admin/shop-schedule", label: "Börse" },
        { href: "/admin/users", label: "Nutzer" },
        { href: "/admin/orgs", label: "Organisationen" },
        { href: "/admin/reimbursements", label: "Erstattungen" },
        { href: "/admin/settings", label: "Einstellungen" },
    ];

    return (
        <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
            <div className="flex items-center justify-between px-6 py-4">
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
                    <div className="hidden md:flex flex-wrap items-center gap-4 ml-8 text-sm font-medium opacity-60">
                        {navLinks.map((link) => (
                            <Link key={link.href} href={link.href} className="hover:opacity-100 transition-opacity">
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={handleLogout}
                        className="hidden md:flex items-center gap-2 text-sm font-bold opacity-60 hover:opacity-100 transition-opacity shrink-0"
                        style={{ color: BRAND.error }}
                    >
                        <span>Abmelden</span>
                        <LogOut size={16} />
                    </button>
                    <button
                        className="md:hidden opacity-60 hover:opacity-100 transition-opacity shrink-0"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-md py-4 px-6 flex flex-col gap-4">
                    {navLinks.map((link) => (
                        <Link 
                            key={link.href} 
                            href={link.href} 
                            className="text-sm font-medium opacity-80 hover:opacity-100 transition-opacity block py-2 border-b border-gray-50 last:border-0"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <div className="h-px bg-gray-100 my-2" />
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-between gap-2 text-sm font-bold opacity-80 hover:opacity-100 transition-opacity w-full text-left py-2"
                        style={{ color: BRAND.error }}
                    >
                        <span>Abmelden</span>
                        <LogOut size={16} />
                    </button>
                </div>
            )}
        </header>
    );
}
