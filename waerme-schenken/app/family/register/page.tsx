'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UploadCloud, ChevronDown, Check } from 'lucide-react';
import { de } from '@/lib/i18n/de';
import { BRAND } from '@/lib/constants';

type Step = 1 | 2 | 3 | 4;

const ORGS = ['Caritas', 'Rotes Kreuz', 'Heilsarmee', 'Diakonie', 'Andere'];

function StepBar({ step }: { step: Step }) {
    return (
        <div className="flex gap-2 mb-10">
            {[1, 2, 3, 4].map((s) => (
                <div key={s} className="h-1 flex-1 rounded-full transition-all"
                    style={{ backgroundColor: s <= step ? BRAND.greenDark : BRAND.white }} />
            ))}
        </div>
    );
}

function Checkbox({ checked, onChange, children }: { checked: boolean; onChange: () => void; children: React.ReactNode }) {
    return (
        <div className="flex gap-3 items-start">
            <button type="button" onClick={onChange}
                className="w-6 h-6 rounded-lg border-2 border-black flex items-center justify-center shrink-0 mt-0.5 transition-colors"
                style={{ backgroundColor: checked ? '#000' : 'transparent' }}>
                {checked && <span className="text-white text-xs">✓</span>}
            </button>
            <p className="text-[13px] leading-relaxed opacity-70">{children}</p>
        </div>
    );
}

export default function FamilyRegisterPage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>(1);
    const [form, setForm] = useState({
        firstName: '', lastName: '', email: '',
        street: '', zipCode: '', city: '',
        socialCardUrl: '', socialCardOrg: '',
        newsletter: false,
        privacy: false,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    function validate1() {
        const e: Record<string, string> = {};
        if (!form.firstName.trim()) e.firstName = de.auth.errors.required;
        if (!form.lastName.trim())  e.lastName  = de.auth.errors.required;
        if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
            e.email = de.auth.errors.emailInvalid;
        if (!form.privacy) e.privacy = de.auth.errors.required;
        return e;
    }

    function validate2() {
        const e: Record<string, string> = {};
        if (!form.street.trim()) e.street = de.auth.errors.required;
        if (!form.zipCode.trim() || !/^\d{4}$/.test(form.zipCode)) e.zipCode = 'Bitte gib eine gültige 4-stellige PLZ ein.';
        if (!form.city.trim()) e.city = de.auth.errors.required;
        return e;
    }

    function validate3() {
        const e: Record<string, string> = {};
        if (!form.socialCardOrg) e.socialCardOrg = 'Bitte wähle eine Organisation.';
        if (!form.socialCardUrl) e.socialCardUrl = 'Bitte lade einen Sozialausweis hoch.';
        return e;
    }

    async function handleNext() {
        if (step === 1) {
            const e = validate1(); if (Object.keys(e).length) { setErrors(e); return; }
            setErrors({}); setStep(2); return;
        }
        if (step === 2) {
            const e = validate2(); if (Object.keys(e).length) { setErrors(e); return; }
            setErrors({}); setStep(3); return;
        }
        if (step === 3) {
            const e = validate3(); if (Object.keys(e).length) { setErrors(e); return; }
            setErrors({});
            setLoading(true);
            try {
                const res = await fetch('/api/auth/send-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'register-family',
                        email: form.email,
                        firstName: form.firstName,
                        lastName:  form.lastName,
                        street:    form.street,
                        zipCode:   form.zipCode,
                        city:      form.city,
                        socialCardUrl: form.socialCardUrl,
                        socialCardOrg: form.socialCardOrg,
                        newsletter: form.newsletter,
                        privacy: form.privacy,
                    }),
                });
                if (!res.ok) { const d = await res.json(); setErrors({ submit: d.error || de.common.error }); return; }
                setStep(4);
            } finally { setLoading(false); }
        }
    }

    async function handleVerify(code: string) {
        setLoading(true);
        try {
            const res = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ email: form.email, code }),
            });
            if (!res.ok) {
                const d = await res.json();
                setErrors({ otp: d.error || de.auth.errors.otpInvalid });
                setLoading(false);
                return;
            }
            // After successful OTP, family is registered. Show pending page.
            // NOTE: do NOT setLoading(false) here — router.replace begins
            // unmounting this component; setting state afterwards triggers
            // React "removeChild" crashes in dev.
            router.replace('/family/pending');
        } catch (err) {
            console.error('[family register] verify exception:', err);
            setErrors({ otp: de.auth.errors.otpInvalid });
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: BRAND.beige }}>
            <div className="max-w-md w-full mx-auto pt-12 px-8">
                <StepBar step={step} />
                <h1 className="mb-8" style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: '27px', lineHeight: '30px' }}>
                    {step === 1 && de.family.register.stepDetails}
                    {step === 2 && de.family.register.stepAddress}
                    {step === 3 && de.family.register.stepSocialCard}
                    {step === 4 && de.auth.otp.heading}
                </h1>
            </div>

            <div className="bg-white max-w-md w-[calc(100%-40px)] mx-auto flex-grow rounded-t-[8px] shadow-sm flex flex-col">
                <div className="w-full mx-auto px-8 py-10 flex flex-col flex-grow">
                    <div className="flex-grow">
                        {step === 1 && (
                            <div className="space-y-7">
                                {[
                                    { key: 'firstName', label: de.family.register.firstName, placeholder: 'Dein Vorname' },
                                    { key: 'lastName',  label: de.family.register.lastName,  placeholder: 'Dein Nachname' },
                                    { key: 'email',     label: de.family.register.email,     placeholder: 'beispiel@mail.com' },
                                ].map(({ key, label, placeholder }) => (
                                    <div key={key} className="space-y-1">
                                        <div className="border-b-2 pb-2" style={{ borderColor: errors[key] ? BRAND.error : '#E5E7EB' }}>
                                            <label className="block mb-1" style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: '15px' }}>{label}</label>
                                            <input type={key === 'email' ? 'email' : 'text'}
                                                value={(form as Record<string, unknown>)[key] as string}
                                                placeholder={placeholder}
                                                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                                                className="w-full font-bold bg-transparent outline-none text-[17px] placeholder:opacity-30" />
                                        </div>
                                        {errors[key] && <p className="text-[12px] font-medium" style={{ color: BRAND.error }}>{errors[key]}</p>}
                                    </div>
                                ))}
                                <Checkbox checked={form.privacy} onChange={() => setForm(f => ({ ...f, privacy: !f.privacy }))}>
                                    {de.family.register.privacy}{' '}
                                    <Link href="/datenschutz" className="underline font-bold">{de.family.register.privacyLink}</Link>.
                                </Checkbox>
                                {errors.privacy && <p className="text-[12px] font-medium" style={{ color: BRAND.error }}>{errors.privacy}</p>}
                            </div>
                        )}

                        {step === 2 && (
                            <AddressStep form={form} setForm={setForm} errors={errors} />
                        )}

                        {step === 3 && (
                            <SocialCardStep form={form} setForm={setForm} errors={errors} />
                        )}

                        {step === 4 && (
                            <OtpStep email={form.email} onVerify={handleVerify} error={errors.otp} loading={loading} />
                        )}

                        {errors.submit && <p className="text-center text-[13px] font-medium mt-4" style={{ color: BRAND.error }}>{errors.submit}</p>}
                    </div>

                    {step < 4 && (
                        <div className="mt-10 flex flex-col items-center gap-4">
                            <button onClick={handleNext} disabled={loading}
                                className="h-10 min-w-[143px] px-6 rounded-full text-white shadow-xl transition-transform active:scale-95 disabled:opacity-60 flex items-center justify-center"
                                style={{ backgroundColor: BRAND.green, fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: '14px', letterSpacing: '0.1em' }}>
                                {loading ? de.common.loading : 'WEITER'}
                            </button>
                            {step > 1 && (
                                <button onClick={() => setStep((s) => (s - 1) as Step)}
                                    className="text-sm font-bold underline opacity-60"
                                    style={{ color: BRAND.green }}>
                                    {de.common.back}
                                </button>
                            )}
                            <p className="text-[12px] font-medium opacity-60">
                                {de.family.register.alreadyAccount}{' '}
                                <Link href="/family/login" className="underline font-bold" style={{ color: BRAND.green }}>
                                    {de.family.register.login}
                                </Link>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Address step with Swiss Post autocomplete ──
type FormShape = {
    firstName: string; lastName: string; email: string;
    street: string; zipCode: string; city: string;
    socialCardUrl: string; socialCardOrg: string;
    newsletter: boolean; privacy: boolean;
};

function AddressStep({ form, setForm, errors }: { form: FormShape; setForm: React.Dispatch<React.SetStateAction<FormShape>>; errors: Record<string, string> }) {
    const [suggestions, setSuggestions] = useState<Array<{ zip: string; city: string }>>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Swiss Post autocomplete: fetch ZIP/city from public opendatasoft API
    useEffect(() => {
        const q = form.zipCode.trim();
        if (q.length < 2) { setSuggestions([]); return; }
        const ctrl = new AbortController();
        const t = setTimeout(async () => {
            try {
                const url = `/api/swiss-post?q=${encodeURIComponent(q)}`;
                const res = await fetch(url, { signal: ctrl.signal });
                if (!res.ok) return;
                const data = await res.json();
                const items = (data.suggestions || []) as Array<{ zip: string; city: string }>;
                // Dedupe by zip+city
                const seen = new Set<string>();
                const unique = items.filter((i: { zip: string; city: string }) => {
                    const k = `${i.zip}-${i.city}`;
                    if (seen.has(k)) return false;
                    seen.add(k); return true;
                });
                setSuggestions(unique);
            } catch { /* silent */ }
        }, 250);
        return () => { ctrl.abort(); clearTimeout(t); };
    }, [form.zipCode]);

    return (
        <div className="space-y-7">
            <div className="space-y-1">
                <div className="border-b-2 pb-2" style={{ borderColor: errors.street ? BRAND.error : '#E5E7EB' }}>
                    <label className="block mb-1" style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: '15px' }}>{de.family.register.street}</label>
                    <input type="text" value={form.street}
                        placeholder="z.B. Musterstrasse 12"
                        onChange={e => setForm(f => ({ ...f, street: e.target.value }))}
                        className="w-full font-bold bg-transparent outline-none text-[17px] placeholder:opacity-30" />
                </div>
                {errors.street && <p className="text-[12px] font-medium" style={{ color: BRAND.error }}>{errors.street}</p>}
            </div>

            <div className="relative space-y-1">
                <div className="border-b-2 pb-2" style={{ borderColor: errors.zipCode ? BRAND.error : '#E5E7EB' }}>
                    <label className="block mb-1" style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: '15px' }}>{de.family.register.zip}</label>
                    <input type="text" inputMode="numeric" maxLength={4} value={form.zipCode}
                        placeholder="8000"
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                        onChange={e => setForm(f => ({ ...f, zipCode: e.target.value.replace(/\D/g, '') }))}
                        className="w-full font-bold bg-transparent outline-none text-[17px] placeholder:opacity-30" />
                </div>
                {errors.zipCode && <p className="text-[12px] font-medium" style={{ color: BRAND.error }}>{errors.zipCode}</p>}

                {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-[8px] shadow-xl border border-gray-100 z-50 max-h-64 overflow-y-auto">
                        {suggestions.map((s, i) => (
                            <button key={i} type="button"
                                onMouseDown={e => e.preventDefault()}
                                onClick={() => {
                                    setForm(f => ({ ...f, zipCode: s.zip, city: s.city }));
                                    setShowSuggestions(false);
                                }}
                                className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 border-b border-gray-50 last:border-b-0">
                                <span className="font-bold">{s.zip}</span> {s.city}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="space-y-1">
                <div className="border-b-2 pb-2" style={{ borderColor: errors.city ? BRAND.error : '#E5E7EB' }}>
                    <label className="block mb-1" style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: '15px' }}>{de.family.register.city}</label>
                    <input type="text" value={form.city}
                        placeholder="z.B. Zürich"
                        onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                        className="w-full font-bold bg-transparent outline-none text-[17px] placeholder:opacity-30" />
                </div>
                {errors.city && <p className="text-[12px] font-medium" style={{ color: BRAND.error }}>{errors.city}</p>}
            </div>
        </div>
    );
}

// ── Social card upload step ──
function SocialCardStep({ form, setForm, errors }: { form: FormShape; setForm: React.Dispatch<React.SetStateAction<FormShape>>; errors: Record<string, string> }) {
    const [orgOpen, setOrgOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);
    const uploaded = !!form.socialCardUrl;

    async function handleFile(file: File | undefined) {
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            alert('Datei zu gross (max. 5 MB).');
            return;
        }
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append('file', file);
            const res = await fetch('/api/upload/social-card', { method: 'POST', body: fd });
            if (res.ok) {
                const { url } = await res.json();
                setForm(f => ({ ...f, socialCardUrl: url }));
            } else {
                let msg = `Upload fehlgeschlagen (HTTP ${res.status}).`;
                try {
                    const data = await res.json();
                    if (data?.error) msg = data.error;
                } catch { /* ignore json parse errors */ }
                console.error('[family register] upload failed:', res.status, msg);
                alert(msg);
            }
        } catch (err) {
            console.error('[family register] upload exception:', err);
            alert('Netzwerkfehler beim Hochladen.');
        } finally { setUploading(false); }
    }

    return (
        <div>
            <p className="text-sm opacity-70 mb-6">{de.family.register.socialCardInfo}</p>

            {/* Org dropdown (green pill) */}
            <div className="relative mb-5">
                <button type="button" onClick={() => setOrgOpen(o => !o)}
                    className="w-full h-11 px-6 rounded-full flex justify-between items-center text-white shadow-md transition-opacity hover:opacity-95"
                    style={{ backgroundColor: BRAND.green, fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: '14px' }}>
                    <span>{form.socialCardOrg || de.family.register.chooseOrg}</span>
                    <ChevronDown size={18} className={`transition-transform ${orgOpen ? 'rotate-180' : ''}`} />
                </button>
                {orgOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-[12px] shadow-xl overflow-hidden z-50">
                        {ORGS.map((o, i) => (
                            <button key={o} type="button"
                                onClick={() => { setForm(f => ({ ...f, socialCardOrg: o })); setOrgOpen(false); }}
                                className={`w-full text-left px-6 py-3.5 text-sm font-bold transition-colors hover:bg-gray-50 ${i < ORGS.length - 1 ? 'border-b border-gray-50' : ''}`}
                                style={{
                                    color: o === form.socialCardOrg ? BRAND.green : '#000',
                                    fontFamily: "'Bricolage Grotesque',sans-serif",
                                    backgroundColor: o === form.socialCardOrg ? 'rgba(83,125,97,0.08)' : '#fff',
                                }}>
                                {o}
                            </button>
                        ))}
                    </div>
                )}
            </div>
            {errors.socialCardOrg && <p className="text-[12px] font-medium mb-3" style={{ color: BRAND.error }}>{errors.socialCardOrg}</p>}

            {/* Upload zone */}
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                className="w-full rounded-[8px] flex flex-col items-center justify-center py-14 px-6 gap-4 transition-colors disabled:opacity-60"
                style={{ backgroundColor: '#EBE6DE' }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: BRAND.green }}>
                    {uploaded
                        ? <Check size={24} color="#fff" strokeWidth={3} />
                        : <UploadCloud size={24} color="#fff" />}
                </div>
                <span className="text-sm" style={{ color: uploaded ? BRAND.green : 'rgb(73,69,79)', fontWeight: uploaded ? 600 : 400 }}>
                    {uploading ? 'Wird hochgeladen...' : uploaded ? de.family.register.uploaded : de.family.register.uploadHint}
                </span>
            </button>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden
                onChange={e => handleFile(e.target.files?.[0])} />
            {errors.socialCardUrl && <p className="text-[12px] font-medium mt-3" style={{ color: BRAND.error }}>{errors.socialCardUrl}</p>}

            <p className="text-[12px] text-center opacity-40 mt-5 leading-relaxed italic">{de.family.register.acceptedCards}</p>
        </div>
    );
}

// ── OTP step ──
function OtpStep({ email, onVerify, error, loading }: { email: string; onVerify: (code: string) => void; error?: string; loading: boolean }) {
    const [code, setCode] = useState('');
    return (
        <>
            <p className="mb-8 opacity-70 text-[15px]">{de.auth.otp.body} <strong>{email}</strong></p>
            <div className="bg-white rounded-[8px] p-8 shadow-sm border border-gray-100">
                <label className="block mb-3" style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: '15px' }}>{de.auth.otp.label}</label>
                <input type="text" inputMode="numeric" maxLength={6} value={code}
                    onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full font-bold bg-transparent outline-none text-[32px] tracking-[0.3em] border-b-2 pb-2"
                    style={{ borderColor: error ? BRAND.error : '#E5E7EB', fontFamily: 'monospace' }}
                    placeholder="000000" autoFocus />
                {error && <p className="text-[12px] font-medium mt-2" style={{ color: BRAND.error }}>{error}</p>}
            </div>
            <div className="mt-14 flex flex-col items-center gap-4">
                <button onClick={() => onVerify(code)} disabled={code.length !== 6 || loading}
                    className="h-10 min-w-[143px] px-6 rounded-full text-white shadow-xl transition-transform active:scale-95 disabled:opacity-40 flex items-center justify-center"
                    style={{ backgroundColor: BRAND.green, fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: '14px', letterSpacing: '0.1em' }}>
                    {loading ? de.common.loading : de.auth.otp.cta.toUpperCase()}
                </button>
            </div>
        </>
    );
}
