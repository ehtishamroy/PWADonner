'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BRAND } from '@/lib/constants';
import { de } from '@/lib/i18n/de';
import { ArrowLeft, Trash2, CheckCircle2 } from 'lucide-react';

export default function DeleteProfilePage() {
    const router = useRouter();
    const [confirmed, setConfirmed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    async function handleDelete() {
        if (!confirmed) return;
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/users/me', { method: 'DELETE' });
            if (!res.ok) throw new Error('Löschen fehlgeschlagen');
            setSuccess(true);
            // Clear session and redirect to welcome after 2s
            setTimeout(() => {
                fetch('/api/auth/logout', { method: 'POST' }).then(() => {
                    router.replace('/welcome');
                });
            }, 2000);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
            setLoading(false);
        }
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center px-5" style={{ backgroundColor: BRAND.beige }}>
                <div className="bg-white rounded-[28px] p-10 shadow-sm flex flex-col items-center text-center max-w-sm w-full">
                    <CheckCircle2 size={48} className="mb-4" style={{ color: BRAND.green }} />
                    <h2 className="font-bold text-xl mb-2" style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                        Profil gelöscht
                    </h2>
                    <p className="opacity-60 text-sm">Alle deine Daten wurden gelöscht. Du wirst weitergeleitet...</p>
                </div>
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

                <h1 className="mb-8" style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: '27px', lineHeight: '30px' }}>
                    Profil löschen
                </h1>

                <div className="bg-white rounded-[28px] p-7 shadow-sm mb-6">
                    <div className="flex items-center justify-center w-14 h-14 rounded-full mb-5 mx-auto" style={{ backgroundColor: `${BRAND.error}15` }}>
                        <Trash2 size={24} style={{ color: BRAND.error }} />
                    </div>
                    <h2 className="font-bold text-center text-lg mb-3" style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                        Wirklich löschen?
                    </h2>
                    <p className="opacity-70 text-sm text-center leading-relaxed mb-6">
                        {de.profile.deleteConfirm}
                    </p>
                    <p className="text-[12px] opacity-50 text-center mb-6">
                        Deine Spendeneinträge und alle Bilder werden unwiderruflich aus der Datenbank entfernt.
                    </p>

                    {/* Confirmation checkbox */}
                    <div className="flex gap-3 items-start mb-6">
                        <button
                            type="button"
                            onClick={() => setConfirmed(!confirmed)}
                            className="w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors"
                            style={{
                                borderColor: confirmed ? BRAND.error : '#E5E7EB',
                                backgroundColor: confirmed ? BRAND.error : 'transparent',
                            }}
                        >
                            {confirmed && <span className="text-white text-xs">✓</span>}
                        </button>
                        <p className="text-[13px] leading-relaxed opacity-70">
                            Ja, ich möchte mein Profil und alle meine Daten unwiderruflich löschen.
                        </p>
                    </div>

                    {error && <p className="text-sm font-bold text-center mb-4" style={{ color: BRAND.error }}>{error}</p>}

                    <button
                        onClick={handleDelete}
                        disabled={!confirmed || loading}
                        className={`w-full py-4 rounded-full text-white font-bold uppercase tracking-widest text-[13px] transition-all
                                  ${(!confirmed || loading) ? 'opacity-40 cursor-not-allowed' : 'hover:opacity-90 active:scale-95'}`}
                        style={{ backgroundColor: BRAND.error, fontFamily: "'Bricolage Grotesque',sans-serif" }}
                    >
                        {loading ? 'Wird gelöscht...' : 'Profil endgültig löschen'}
                    </button>
                </div>

                <Link href="/donor/profile"
                    className="block text-center text-sm font-bold underline opacity-50 hover:opacity-100 transition-opacity">
                    Abbrechen
                </Link>
            </div>
        </div>
    );
}
