'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { BRAND } from '@/lib/constants';
import { de } from '@/lib/i18n/de';

export default function FamilyEditAddressPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving,  setSaving]  = useState(false);
    const [success, setSuccess] = useState(false);
    const [error,   setError]   = useState('');
    const [form,    setForm]    = useState({ street: '', zipCode: '', city: '' });
    const [suggestions, setSuggestions] = useState<Array<{ zip: string; city: string }>>([]);
    const [showSugg, setShowSugg] = useState(false);

    useEffect(() => {
        fetch('/api/users/me')
            .then(r => r.json())
            .then(d => {
                if (d.user) setForm({
                    street:  d.user.street  || '',
                    zipCode: d.user.zipCode || '',
                    city:    d.user.city    || '',
                });
                setLoading(false);
            })
            .catch(() => { setError('Fehler beim Laden'); setLoading(false); });
    }, []);

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
                const seen = new Set<string>();
                setSuggestions(items.filter((i: { zip: string; city: string }) => {
                    const k = `${i.zip}-${i.city}`;
                    if (seen.has(k)) return false;
                    seen.add(k); return true;
                }));
            } catch { /* silent */ }
        }, 250);
        return () => { ctrl.abort(); clearTimeout(t); };
    }, [form.zipCode]);

    async function save(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true); setError('');
        try {
            const res = await fetch('/api/users/me', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            if (!res.ok) throw new Error('Speichern fehlgeschlagen');
            setSuccess(true);
            setTimeout(() => { router.push('/family/profile'); router.refresh(); }, 1200);
        } catch (err) {
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
                <Link href="/family/profile" className="flex items-center gap-2 mb-8 font-bold text-sm tracking-wide hover:opacity-70">
                    <ArrowLeft size={18} /> Zurück
                </Link>

                <h1 className="mb-8" style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: '27px', lineHeight: '30px' }}>
                    Adresse bearbeiten
                </h1>

                {success ? (
                    <div className="bg-white rounded-[8px] p-8 shadow-sm flex flex-col items-center text-center">
                        <CheckCircle2 size={48} className="mb-4" style={{ color: BRAND.green }} />
                        <h3 className="font-bold text-lg mb-2" style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                            Erfolgreich gespeichert!
                        </h3>
                    </div>
                ) : (
                    <form onSubmit={save} className="bg-white rounded-[8px] p-7 shadow-sm space-y-6">
                        <div>
                            <label className="text-[11px] font-bold uppercase tracking-widest opacity-40 block mb-2"
                                style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>Strasse und Nr.</label>
                            <input type="text" required value={form.street}
                                onChange={e => setForm(f => ({ ...f, street: e.target.value }))}
                                placeholder="z.B. Musterstrasse 12"
                                className="w-full font-bold text-[17px] bg-transparent outline-none border-b-2 border-gray-100 focus:border-gray-300 pb-2 placeholder:opacity-20" />
                        </div>

                        <div className="relative">
                            <label className="text-[11px] font-bold uppercase tracking-widest opacity-40 block mb-2"
                                style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>PLZ</label>
                            <input type="text" inputMode="numeric" maxLength={4} required value={form.zipCode}
                                onFocus={() => setShowSugg(true)}
                                onBlur={() => setTimeout(() => setShowSugg(false), 150)}
                                onChange={e => setForm(f => ({ ...f, zipCode: e.target.value.replace(/\D/g, '') }))}
                                placeholder="8000"
                                className="w-full font-bold text-[17px] bg-transparent outline-none border-b-2 border-gray-100 focus:border-gray-300 pb-2 placeholder:opacity-20" />
                            {showSugg && suggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-[8px] shadow-xl border border-gray-100 z-50 max-h-64 overflow-y-auto">
                                    {suggestions.map((s, i) => (
                                        <button key={i} type="button"
                                            onMouseDown={e => e.preventDefault()}
                                            onClick={() => {
                                                setForm(f => ({ ...f, zipCode: s.zip, city: s.city }));
                                                setShowSugg(false);
                                            }}
                                            className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 border-b border-gray-50 last:border-b-0">
                                            <span className="font-bold">{s.zip}</span> {s.city}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="text-[11px] font-bold uppercase tracking-widest opacity-40 block mb-2"
                                style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>Ort</label>
                            <input type="text" required value={form.city}
                                onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                                placeholder="z.B. Zürich"
                                className="w-full font-bold text-[17px] bg-transparent outline-none border-b-2 border-gray-100 focus:border-gray-300 pb-2 placeholder:opacity-20" />
                        </div>

                        {error && <p className="text-sm font-bold" style={{ color: BRAND.error }}>{error}</p>}

                        <button type="submit" disabled={saving}
                            className="mx-auto h-10 min-w-[143px] px-6 rounded-full text-white font-bold uppercase tracking-widest text-[13px] flex items-center justify-center disabled:opacity-50"
                            style={{ backgroundColor: BRAND.green, fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                            {saving ? de.common.loading : de.common.save}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
