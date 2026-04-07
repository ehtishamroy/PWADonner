'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/brand/Logo';
import { BRAND } from '@/lib/constants';

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/admin/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.error || 'Fehler beim Anmelden');
                return;
            }

            // Force hard refresh to ensure middleware catches the new cookie properly
            window.location.href = '/admin/dashboard';
        } catch {
            setError('Netzwerkfehler');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: BRAND.beige }}>
            <div className="bg-white rounded-[8px] shadow-xl p-8 w-full max-w-sm">
                <div className="flex justify-center mb-6">
                    <Logo size={60} animated={false} />
                </div>
                <h1 className="text-center font-bold text-2xl mb-8" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                    Admin Login
                </h1>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="text-xs font-bold uppercase tracking-widest opacity-40 block mb-2 font-sans">
                            E-Mail
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            className="w-full border-b-2 border-gray-200 pb-2 bg-transparent outline-none font-medium transition-colors focus:border-brand-green"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase tracking-widest opacity-40 block mb-2 font-sans">
                            Passwort
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            className="w-full border-b-2 border-gray-200 pb-2 bg-transparent outline-none font-medium transition-colors focus:border-brand-green"
                        />
                    </div>

                    {error && (
                        <p className="text-sm font-medium" style={{ color: BRAND.error }}>{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="mx-auto h-10 min-w-[143px] px-6 rounded-full text-white font-bold uppercase tracking-widest text-[13px] transition-transform active:scale-95 disabled:opacity-50 mt-4 flex items-center justify-center"
                        style={{ backgroundColor: BRAND.green, fontFamily: "'Bricolage Grotesque', sans-serif" }}
                    >
                        {loading ? 'Laden...' : 'Anmelden'}
                    </button>
                </form>
            </div>
        </div>
    );
}
