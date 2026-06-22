'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BRAND } from '@/lib/constants';
import { de } from '@/lib/i18n/de';
import { Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function EditAddressPage() {
    const router = useRouter();
    const [form,    setForm]    = useState({ street: '', zipCode: '', city: '' });
    const [loading, setLoading] = useState(true);
    const [saving,  setSaving]  = useState(false);
    const [success, setSuccess] = useState(false);
    const [error,   setError]   = useState('');

    // ZIP suggestions
    const [zipSuggestions, setZipSuggestions]   = useState<Array<{ zip: string; city: string }>>([]);
    const [showZipSugg,    setShowZipSugg]       = useState(false);

    // Street suggestions
    const [streetSuggestions, setStreetSuggestions] = useState<Array<{ street: string; zip: string; city: string }>>([]);
    const [showStreetSugg,    setShowStreetSugg]    = useState(false);

    // Load current address
    useEffect(() => {
        fetch('/api/users/me')
            .then(res => res.json())
            .then(data => {
                if (data.user) setForm({
                    street:  data.user.street  || '',
                    zipCode: data.user.zipCode || '',
                    city:    data.user.city    || '',
                });
                setLoading(false);
            })
            .catch(() => { setError('Fehler beim Laden der Daten'); setLoading(false); });
    }, []);

    // Street autocomplete
    useEffect(() => {
        const q = form.street.trim();
        if (q.length < 2) { setStreetSuggestions([]); return; }
        const ctrl = new AbortController();
        const t = setTimeout(async () => {
            try {
                const zip = form.zipCode.trim();
                const url = `/api/swiss-streets?q=${encodeURIComponent(q)}${zip.length >= 4 ? `&zip=${zip}` : ''}`;
                const res = await fetch(url, { signal: ctrl.signal });
                if (!res.ok) return;
                const data = await res.json();
                setStreetSuggestions((data.suggestions || []) as Array<{ street: string; zip: string; city: string }>);
            } catch { /* silent */ }
        }, 250);
        return () => { ctrl.abort(); clearTimeout(t); };
    }, [form.street, form.zipCode]);

    // ZIP autocomplete
    useEffect(() => {
        const q = form.zipCode.trim();
        if (q.length < 2) { setZipSuggestions([]); return; }
        const ctrl = new AbortController();
        const t = setTimeout(async () => {
            try {
                const res = await fetch(`/api/swiss-post?q=${encodeURIComponent(q)}`, { signal: ctrl.signal });
                if (!res.ok) return;
                const data = await res.json();
                const items = (data.suggestions || []) as Array<{ zip: string; city: string }>;
                const seen = new Set<string>();
                setZipSuggestions(items.filter((i) => {
                    const k = `${i.zip}-${i.city}`;
                    if (seen.has(k)) return false;
                    seen.add(k); return true;
                }));
            } catch { /* silent */ }
        }, 250);
        return () => { ctrl.abort(); clearTimeout(t); };
    }, [form.zipCode]);

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            const res = await fetch('/api/users/me', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            if (!res.ok) throw new Error('Speichern fehlgeschlagen');
            setSuccess(true);
            setTimeout(() => { router.push('/donor/profile'); router.refresh(); }, 1500);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Fehler');
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BRAND.beige }}>
                <Loader2 className="animate-spin opacity-50" size={32} />
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-12 px-5 pb-24" style={{ backgroundColor: BRAND.beige }}>
            <div className="max-w-md mx-auto">
                <Link href="/donor/profile" className="inline-flex items-center gap-2 mb-8">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M12 5L7 10L12 15" stroke={BRAND.green} strokeWidth="2.5" strokeLinecap="round"/>
                    </svg>
                    <span className="font-bold uppercase tracking-widest text-sm"
                        style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                        Zurück
                    </span>
                </Link>

                <h1 className="mb-8"
                    style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: '27px', lineHeight: '30px' }}>
                    Adresse bearbeiten
                </h1>

                {success ? (
                    <div className="bg-white rounded-[28px] p-8 shadow-sm flex flex-col items-center justify-center text-center">
                        <CheckCircle2 size={48} className="mb-4" style={{ color: BRAND.green }} />
                        <h3 className="font-bold text-lg mb-2" style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>Erfolgreich gespeichert!</h3>
                        <p className="opacity-60 text-sm">Du wirst weitergeleitet...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSave} className="bg-white rounded-[28px] p-7 shadow-sm space-y-6">

                        {/* Street */}
                        <div className="relative">
                            <label className="text-[11px] font-bold uppercase tracking-widest opacity-40 block mb-2"
                                style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                                Strasse und Nr. <span className="opacity-60 normal-case tracking-normal">(optional)</span>
                            </label>
                            <input
                                type="text"
                                value={form.street}
                                onChange={e => setForm(f => ({ ...f, street: e.target.value }))}
                                onFocus={() => setShowStreetSugg(true)}
                                onBlur={() => setTimeout(() => setShowStreetSugg(false), 150)}
                                placeholder="z.B. Musterstrasse 12"
                                className="w-full font-bold text-[17px] bg-transparent outline-none border-b-2 border-gray-100 focus:border-gray-300 pb-2 transition-colors placeholder:opacity-20"
                            />
                            {showStreetSugg && streetSuggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-[8px] shadow-xl border border-gray-100 z-50 max-h-56 overflow-y-auto">
                                    {streetSuggestions.map((s, i) => (
                                        <button key={i} type="button"
                                            onMouseDown={e => e.preventDefault()}
                                            onClick={() => {
                                                setForm(f => ({
                                                    ...f,
                                                    street: s.street,
                                                    ...(s.zip  ? { zipCode: s.zip }  : {}),
                                                    ...(s.city ? { city:    s.city } : {}),
                                                }));
                                                setShowStreetSugg(false);
                                            }}
                                            className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 border-b border-gray-50 last:border-b-0">
                                            <span className="font-bold">{s.street}</span>
                                            {s.zip && <span className="opacity-50 ml-2 text-xs">{s.zip} {s.city}</span>}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* PLZ */}
                        <div className="relative">
                            <label className="text-[11px] font-bold uppercase tracking-widest opacity-40 block mb-2"
                                style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                                PLZ
                            </label>
                            <input
                                type="text"
                                inputMode="numeric"
                                maxLength={4}
                                value={form.zipCode}
                                onChange={e => setForm(f => ({ ...f, zipCode: e.target.value.replace(/\D/g, ''), city: '' }))}
                                onFocus={() => setShowZipSugg(true)}
                                onBlur={() => setTimeout(() => setShowZipSugg(false), 150)}
                                placeholder="z.B. 8000"
                                className="w-full font-bold text-[17px] bg-transparent outline-none border-b-2 border-gray-100 focus:border-gray-300 pb-2 transition-colors placeholder:opacity-20"
                            />
                            {showZipSugg && zipSuggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-[8px] shadow-xl border border-gray-100 z-50 max-h-56 overflow-y-auto">
                                    {zipSuggestions.map((s, i) => (
                                        <button key={i} type="button"
                                            onMouseDown={e => e.preventDefault()}
                                            onClick={() => { setForm(f => ({ ...f, zipCode: s.zip, city: s.city })); setShowZipSugg(false); }}
                                            className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 border-b border-gray-50 last:border-b-0">
                                            <span className="font-bold">{s.zip}</span> {s.city}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* City — auto-filled from ZIP, editable */}
                        <div>
                            <label className="text-[11px] font-bold uppercase tracking-widest opacity-40 block mb-2"
                                style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                                Ort
                            </label>
                            <input
                                type="text"
                                value={form.city}
                                onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                                placeholder="z.B. Zürich"
                                className="w-full font-bold text-[17px] bg-transparent outline-none border-b-2 border-gray-100 focus:border-gray-300 pb-2 transition-colors placeholder:opacity-20"
                            />
                        </div>

                        {error && <p className="text-sm font-bold" style={{ color: BRAND.error }}>{error}</p>}

                        <button
                            type="submit"
                            disabled={saving}
                            className={`mx-auto h-10 min-w-[143px] px-6 rounded-full text-white font-bold uppercase tracking-widest text-[13px] transition-all flex items-center justify-center
                                      ${saving ? 'opacity-70' : 'hover:opacity-90 active:scale-95'}`}
                            style={{ backgroundColor: BRAND.green, fontFamily: "'Bricolage Grotesque',sans-serif" }}
                        >
                            {saving ? de.common.loading : de.common.save}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
