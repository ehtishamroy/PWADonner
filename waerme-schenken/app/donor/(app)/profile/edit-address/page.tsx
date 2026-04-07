'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BRAND } from '@/lib/constants';
import { de } from '@/lib/i18n/de';
import { ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function EditAddressPage() {
    const router = useRouter();
    const [zipCode, setZipCode] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Fetch current user details
        fetch('/api/users/me')
            .then(res => res.json())
            .then(data => {
                if (data.user) {
                    setZipCode(data.user.zipCode || '');
                }
                setLoading(false);
            })
            .catch(() => {
                setError('Fehler beim Laden Daten');
                setLoading(false);
            });
    }, []);

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setError('');
        
        try {
            const res = await fetch('/api/users/me', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ zipCode }),
            });
            
            if (!res.ok) throw new Error('Speichern fehlgeschlagen');
            
            setSuccess(true);
            setTimeout(() => {
                router.push('/donor/profile');
                router.refresh();
            }, 1500);
        } catch (err: any) {
            setError(err.message);
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
                <Link href="/donor/profile" className="flex items-center gap-2 mb-8 font-bold text-sm tracking-wide hover:opacity-70 transition-opacity">
                    <ArrowLeft size={18} />
                    Zurück
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
                    <form onSubmit={handleSave} className="bg-white rounded-[28px] p-7 shadow-sm">
                        <div className="mb-8">
                            <label className="text-[11px] font-bold uppercase tracking-widest opacity-40 block mb-2"
                                style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                                PLZ / Ort
                            </label>
                            <input
                                type="text"
                                value={zipCode}
                                onChange={(e) => setZipCode(e.target.value)}
                                placeholder="z.B. 8000 Zürich"
                                className="w-full font-bold text-[18px] bg-transparent outline-none border-b-2 border-gray-100 focus:border-gray-300 pb-2 transition-colors placeholder:opacity-20"
                                required
                            />
                        </div>

                        {error && (
                            <p className="text-sm font-bold mb-4" style={{ color: BRAND.error }}>{error}</p>
                        )}

                        <button
                            type="submit"
                            disabled={saving}
                            className={`mx-auto h-10 min-w-[143px] px-6 rounded-full text-white font-bold uppercase tracking-widest text-[13px] transition-all flex items-center justify-center
                                      ${saving ? 'opacity-70' : 'hover:opacity-90 active:scale-95'}`}
                            style={{ backgroundColor: BRAND.green, fontFamily: "'Bricolage Grotesque',sans-serif" }}
                        >
                            {saving ? 'Speichert...' : 'Speichern'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
