'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { de } from '@/lib/i18n/de';
import { BRAND } from '@/lib/constants';

type Step = 1 | 2 | 3;

function StepBar({ step }: { step: Step }) {
    return (
        <div className="flex gap-2 mb-10">
            {[1, 2, 3].map((s) => (
                <div
                    key={s}
                    className="h-1 flex-1 rounded-full transition-all"
                    style={{ backgroundColor: s <= step ? BRAND.greenDark : BRAND.white }}
                />
            ))}
        </div>
    );
}

export default function DonorRegisterPage() {
    const router    = useRouter();
    const [step, setStep]     = useState<Step>(1);
    const [form, setForm]     = useState({
        firstName: '',
        lastName: '',
        email: '',
        zipCode: '',
        newsletter: false,
        emailShare: false,
        privacy: false,
    });
    const [errors, setErrors]   = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load persisted state
    useEffect(() => {
        const saved = localStorage.getItem('ws_register_form');
        if (saved) {
            try {
                const { form: savedForm, step: savedStep } = JSON.parse(saved);
                if (savedForm) setForm(savedForm);
                if (savedStep) setStep(savedStep);
            } catch (e) {
                console.error('Failed to parse saved form', e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Persist state on change
    useEffect(() => {
        // We only persist steps 1 and 2. Step 3 (OTP) shouldn't be persisted to avoid confusion if the code expires.
        if (isLoaded && step < 3) {
            localStorage.setItem('ws_register_form', JSON.stringify({ form, step }));
        }
    }, [form, step, isLoaded]);

    function validate() {
        const e: Record<string, string> = {};
        if (!form.firstName.trim()) e.firstName = de.auth.errors.required;
        if (!form.lastName.trim())  e.lastName  = de.auth.errors.required;
        if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
            e.email = de.auth.errors.emailInvalid;
        if (!form.privacy) e.privacy = de.auth.errors.required;
        return e;
    }

    async function handleNext() {
        if (step === 1) {
            const e = validate();
            if (Object.keys(e).length) { setErrors(e); return; }
            setErrors({});
            setStep(2);
        } else if (step === 2) {
            setLoading(true);
            try {
                const res = await fetch('/api/auth/send-otp', {
                    method:  'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body:    JSON.stringify({
                        email: form.email,
                        firstName: form.firstName,
                        lastName: form.lastName,
                        zipCode: form.zipCode,
                        newsletter: form.newsletter,
                        emailShare: form.emailShare,
                        privacy: form.privacy,
                        action: 'register',
                    }),
                });
                if (!res.ok) { const d = await res.json(); setErrors({ submit: d.error || de.common.error }); return; }
                setStep(3);
            } finally { setLoading(false); }
        }
    }

    async function handleVerify(code: string) {
        setLoading(true);
        try {
            const res = await fetch('/api/auth/verify-otp', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ email: form.email, code }),
            });
            if (!res.ok) { const d = await res.json(); setErrors({ otp: d.error || de.auth.errors.otpInvalid }); return; }
            localStorage.removeItem('ws_register_form');
            router.replace('/donor/dashboard');
        } finally { setLoading(false); }
    }

    function Checkbox({ checked, onChange, children }: { checked: boolean; onChange: () => void; children: React.ReactNode }) {
        return (
            <div className="flex gap-3 items-start">
                <button
                    type="button"
                    onClick={onChange}
                    className="w-6 h-6 rounded-lg border-2 border-black flex items-center justify-center shrink-0 mt-0.5 transition-colors"
                    style={{ backgroundColor: checked ? '#000' : 'transparent' }}
                >
                    {checked && <span className="text-white text-xs">✓</span>}
                </button>
                <p className="text-[13px] leading-relaxed opacity-70">{children}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: BRAND.beige }}>
            {/* Top Section — Beige */}
            <div className="max-w-md w-full mx-auto pt-12 px-8">
                <StepBar step={step} />

                {step === 1 && (
                    <h1 className="mb-8" style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: '27px', lineHeight: '30px', letterSpacing: '0.01em' }}>
                        {de.auth.register.heading}
                    </h1>
                )}
                {step === 2 && (
                    <h1 className="mb-8" style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: '27px', lineHeight: '30px' }}>
                        {de.auth.register.stepNewsletter}
                    </h1>
                )}
                {step === 3 && (
                    <h1 className="mb-4" style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: '27px', lineHeight: '30px' }}>
                        {de.auth.otp.heading}
                    </h1>
                )}
            </div>

            {/* Bottom Section — White, extends to bottom with margins */}
            <div className="bg-white max-w-md w-[calc(100%-40px)] mx-auto flex-grow rounded-t-[8px] shadow-sm flex flex-col">
                <div className="w-full mx-auto px-8 py-10 flex flex-col flex-grow">
                    
                    <div className="flex-grow">
                        {/* Step 1 — Personal details */}
                        {step === 1 && (
                            <div className="space-y-7">
                                {[
                                    { key: 'firstName', label: de.auth.register.firstName, placeholder: 'Dein Vorname' },
                                    { key: 'lastName',  label: de.auth.register.lastName,  placeholder: 'Dein Nachname' },
                                    { key: 'email',     label: de.auth.register.email,     placeholder: 'beispiel@mail.com' },
                                    { key: 'zipCode',   label: 'PLZ (optional)',            placeholder: 'z.B. 8000' },
                                ].map(({ key, label, placeholder }) => (
                                    <div key={key} className="space-y-1">
                                        <div className="border-b-2 pb-2" style={{ borderColor: errors[key] ? BRAND.error : '#E5E7EB' }}>
                                            <label className="block mb-1"
                                                style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: '15px', fontWeight: 400, color: '#000000' }}>{label}</label>
                                            <input
                                                type={key === 'email' ? 'email' : 'text'}
                                                value={(form as Record<string, unknown>)[key] as string}
                                                placeholder={placeholder}
                                                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                                                className="w-full font-bold bg-transparent outline-none text-[17px] placeholder:opacity-30 placeholder:font-bold"
                                            />
                                        </div>
                                        {errors[key] && <p className="text-[12px] font-medium" style={{ color: BRAND.error }}>{errors[key]}</p>}
                                    </div>
                                ))}

                                {/* Privacy checkbox */}
                                <Checkbox checked={form.privacy} onChange={() => setForm(f => ({ ...f, privacy: !f.privacy }))}>
                                    {de.auth.register.privacy}{' '}
                                    <Link href="/datenschutz" className="underline font-bold">{de.auth.register.privacyLink}</Link>.
                                </Checkbox>
                                {errors.privacy && <p className="text-[12px] font-medium" style={{ color: BRAND.error }}>{errors.privacy}</p>}
                            </div>
                        )}

                        {/* Step 2 — Consents */}
                        {step === 2 && (
                            <div className="space-y-6">
                                <Checkbox checked={form.newsletter} onChange={() => setForm(f => ({ ...f, newsletter: !f.newsletter }))}>
                                    {de.auth.register.newsletter}
                                </Checkbox>
                                <div className="border-t border-gray-100 pt-6">
                                    <Checkbox checked={form.emailShare} onChange={() => setForm(f => ({ ...f, emailShare: !f.emailShare }))}>
                                        Ich erlaube Wärme Schenken, meine E-Mail-Adresse mit Familien zu teilen, damit sie mir eine Dankes-Nachricht schicken können.
                                    </Checkbox>
                                </div>
                            </div>
                        )}

                        {/* Step 3 — OTP */}
                        {step === 3 && (
                            <OtpStepContent email={form.email} onVerify={handleVerify} error={errors.otp} />
                        )}

                        {errors.submit && <p className="text-center text-[13px] font-medium mt-4" style={{ color: BRAND.error }}>{errors.submit}</p>}
                    </div>

                    {/* Navigation Buttons — always at bottom of white area */}
                    {step < 3 && (
                        <div className="mt-10 flex flex-col items-center gap-4">
                            <button
                                onClick={handleNext}
                                disabled={loading}
                                className="h-10 min-w-[143px] px-6 rounded-full text-white shadow-xl transition-transform active:scale-95 disabled:opacity-60 flex items-center justify-center"
                                style={{ backgroundColor: BRAND.green, fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: '14px', letterSpacing: '0.1em' }}
                            >
                                {loading ? de.common.loading : de.auth.register.next.toUpperCase()}
                            </button>
                            <p className="text-[12px] font-medium opacity-60">
                                {de.auth.register.alreadyAccount}{' '}
                                <Link href="/donor/login" className="underline font-bold" style={{ color: BRAND.green }}>
                                    {de.auth.register.login}
                                </Link>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

}

function OtpStepContent({ email, onVerify, error }: { email: string; onVerify: (code: string) => void; error?: string }) {
    const [code, setCode] = useState('');

    return (
        <>
            <p className="mb-8 opacity-70 text-[15px]">{de.auth.otp.body} <strong>{email}</strong></p>
            <div className="bg-white rounded-[8px] p-8 shadow-sm">
                <label className="block mb-3"
                    style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: '15px', fontWeight: 400, color: '#000000' }}>{de.auth.otp.label}</label>
                <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full font-bold bg-transparent outline-none text-[32px] tracking-[0.3em] border-b-2 pb-2"
                    style={{ borderColor: error ? BRAND.error : '#E5E7EB', fontFamily: 'monospace' }}
                    placeholder="000000"
                />
                {error && <p className="text-[12px] font-medium mt-2" style={{ color: BRAND.error }}>{error}</p>}
            </div>
            <div className="mt-14 flex flex-col items-center gap-4">
                <button
                    onClick={() => onVerify(code)}
                    disabled={code.length !== 6}
                    className="h-10 min-w-[143px] px-6 rounded-full text-white shadow-xl transition-transform active:scale-95 disabled:opacity-40 flex items-center justify-center"
                    style={{ backgroundColor: BRAND.green, fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: '14px', letterSpacing: '0.1em' }}
                >
                    {de.auth.otp.cta.toUpperCase()}
                </button>
            </div>
        </>
    );
}
