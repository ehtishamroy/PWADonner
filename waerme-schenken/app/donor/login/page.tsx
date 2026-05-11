'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Logo } from '@/components/brand/Logo';
import { de } from '@/lib/i18n/de';
import { BRAND } from '@/lib/constants';

export default function DonorLoginPage() {
    const router  = useRouter();
    const [step,  setStep]  = useState<1 | 2>(1);
    const [email, setEmail] = useState('');
    const [code,  setCode]  = useState('');
    const [error, setError] = useState('');
    const [notFound, setNotFound] = useState(false);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [loading, setLoading] = useState(false);

    async function sendOtp() {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError(de.auth.errors.emailInvalid);
            return;
        }
        setLoading(true);
        setError('');
        setNotFound(false);
        try {
            const res = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, action: 'login' }),
            });
            if (!res.ok) {
                const d = await res.json();
                if (d.userNotFound) { setNotFound(true); return; }
                setError(d.error || de.common.error);
                return;
            }
            setStep(2);
        } finally { setLoading(false); }
    }

    async function verifyOtp() {
        if (code.length !== 6) return;
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code }),
            });
            if (!res.ok) { const d = await res.json(); setError(d.error || de.auth.errors.otpInvalid); return; }
            const d = await res.json();
            if (d.role === 'family') router.replace('/family/dashboard');
            else if (d.role === 'donor') router.replace('/donor/dashboard');
            else router.replace('/');
        } finally { setLoading(false); }
    }

    return (
        <div className="min-h-screen pt-12 px-8 flex flex-col items-center" style={{ backgroundColor: BRAND.beige }}>
            <div className="max-w-md w-full">
                <div className="flex justify-center mb-8">
                    <Link href="/" className="inline-block">
                        <Logo size={64} />
                    </Link>
                </div>
                <h1 className="mb-10 text-center" style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: '27px', lineHeight: '30px' }}>
                    {step === 1 ? de.auth.login.heading : de.auth.otp.heading}
                </h1>

                <div className="bg-white rounded-[8px] p-8 shadow-sm">
                    {step === 1 ? (
                        <div>
                            <label className="text-xs font-bold uppercase tracking-widest opacity-40 block mb-2"
                                style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                                {de.auth.login.emailLabel}
                            </label>
                            <div className="border-b-2 pb-2" style={{ borderColor: error ? BRAND.error : '#E5E7EB' }}>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder={de.auth.login.emailPlaceholder}
                                    className="w-full font-bold bg-transparent outline-none text-[17px]"
                                    onKeyDown={e => e.key === 'Enter' && sendOtp()}
                                />
                            </div>
                        </div>
                    ) : (
                        <div>
                            <p className="opacity-70 text-[15px] mb-6">{de.auth.otp.body} <strong>{email}</strong></p>
                            <label className="text-xs font-bold uppercase tracking-widest opacity-40 block mb-2"
                                style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                                {de.auth.otp.label}
                            </label>
                            <input
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                value={code}
                                onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                                className="w-full font-bold bg-transparent outline-none text-[32px] tracking-[0.3em] border-b-2 pb-2"
                                style={{ borderColor: error ? BRAND.error : '#E5E7EB', fontFamily: 'monospace' }}
                                placeholder="000000"
                                autoFocus
                            />
                        </div>
                    )}
                    {notFound && (
                        <p className="text-[13px] font-medium mt-3" style={{ color: BRAND.error }}>
                            Diese E-Mail-Adresse ist nicht registriert.{' '}
                            <Link href="/donor/register" className="underline font-bold" style={{ color: BRAND.green }}>
                                Jetzt registrieren
                            </Link>
                        </p>
                    )}
                    {error && <p className="text-[12px] font-medium mt-3" style={{ color: BRAND.error }}>{error}</p>}
                </div>

                <div className="mt-14 flex flex-col items-center gap-4">
                    <button
                        onClick={step === 1 ? sendOtp : verifyOtp}
                        disabled={loading || (step === 2 && code.length !== 6)}
                        className="h-10 min-w-[143px] px-6 rounded-full text-white shadow-xl transition-transform active:scale-95 disabled:opacity-50 flex items-center justify-center"
                        style={{ backgroundColor: BRAND.green, fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: '14px', letterSpacing: '0.1em' }}
                    >
                        {loading ? de.common.loading : (step === 1 ? de.auth.login.cta : de.auth.otp.cta).toUpperCase()}
                    </button>
                    <p className="text-[12px] font-medium opacity-100">
                        {de.auth.login.noAccount}<br />
                        <button
                            onClick={() => setShowRoleModal(true)}
                            className="underline font-bold bg-transparent border-0 p-0 cursor-pointer"
                            style={{ color: BRAND.green }}
                        >
                            {de.auth.login.register}
                        </button>
                    </p>
                </div>
            </div>

            {/* Role Selection Modal */}
            {showRoleModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowRoleModal(false)}>
                    <div className="bg-white rounded-[20px] p-8 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold mb-2 text-center" style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                            Als was möchtest du dich registrieren?
                        </h3>
                        <p className="text-sm opacity-60 text-center mb-6">Wähle deine Rolle aus</p>

                        <div className="space-y-3">
                            <Link
                                href="/donor/register"
                                onClick={() => setShowRoleModal(false)}
                                className="block w-full p-4 rounded-xl border-2 hover:border-green-500 hover:bg-green-50 transition-colors"
                                style={{ borderColor: '#e5e7eb' }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: BRAND.green }}>
                                        <span className="text-white font-bold text-lg">S</span>
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold">Spender</p>
                                        <p className="text-xs opacity-60">Spielzeug spenden</p>
                                    </div>
                                </div>
                            </Link>

                            <Link
                                href="/family/register"
                                onClick={() => setShowRoleModal(false)}
                                className="block w-full p-4 rounded-xl border-2 hover:border-yellow-500 hover:bg-yellow-50 transition-colors"
                                style={{ borderColor: '#e5e7eb' }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: BRAND.mustard }}>
                                        <span className="text-white font-bold text-lg">F</span>
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold">Familie</p>
                                        <p className="text-xs opacity-60">Spielzeug erhalten</p>
                                    </div>
                                </div>
                            </Link>
                        </div>

                        <button
                            onClick={() => setShowRoleModal(false)}
                            className="w-full mt-6 py-3 rounded-full font-bold text-sm opacity-60 hover:opacity-100 transition-opacity"
                        >
                            Abbrechen
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
