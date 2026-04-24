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
    const [loading, setLoading] = useState(false);

    async function sendOtp() {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError(de.auth.errors.emailInvalid);
            return;
        }
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, action: 'login' }),
            });
            if (!res.ok) { const d = await res.json(); setError(d.error || de.common.error); return; }
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
                    <Logo size={64} />
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
                    <p className="text-[12px] font-medium opacity-60">
                        {de.auth.login.noAccount}<br />
                        <Link href="/donor/register" className="underline font-bold" style={{ color: BRAND.green }}>
                            {de.auth.login.register}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
