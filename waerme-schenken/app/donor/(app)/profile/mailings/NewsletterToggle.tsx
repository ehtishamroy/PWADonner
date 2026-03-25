'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BRAND } from '@/lib/constants';

export default function NewsletterToggle({ initialConsent }: { initialConsent: boolean }) {
    const [consent, setConsent] = useState(initialConsent);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function toggleConsent() {
        setLoading(true);
        const newConsent = !consent;
        
        try {
            const res = await fetch('/api/donor/profile/newsletter', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ consent: newConsent }),
            });

            if (res.ok) {
                setConsent(newConsent);
                router.refresh();
            } else {
                alert('Ein Fehler ist aufgetreten.');
            }
        } catch {
            alert('Netzwerkfehler');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="mt-8 border-t border-gray-100 pt-8">
            <div className="flex items-center justify-between p-5 rounded-2xl bg-gray-50 border border-gray-100">
                <div>
                    <p className="font-bold text-[15px] mb-1">Status</p>
                    <p className="text-sm opacity-60 flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${consent ? "bg-brand-green" : "bg-red-400"}`}></span>
                        {consent ? 'Du bist angemeldet' : 'Du bist abgemeldet'}
                    </p>
                </div>
                
                <button 
                    onClick={toggleConsent}
                    disabled={loading}
                    className="px-6 py-3 rounded-full font-bold uppercase tracking-widest text-[11px] transition-transform active:scale-95 disabled:opacity-50"
                    style={{ 
                        fontFamily: "'Bricolage Grotesque', sans-serif",
                        backgroundColor: consent ? 'transparent' : BRAND.green,
                        color: consent ? BRAND.error : 'white',
                        border: consent ? `2px solid ${BRAND.error}` : 'none'
                    }}
                >
                    {loading ? 'Laden...' : (consent ? 'Abmelden' : 'Anmelden')}
                </button>
            </div>
            
            <p className="text-[11px] opacity-40 text-center mt-4 px-4">
                {consent 
                    ? 'Du erhältst unsere Infomails an deine registrierte E-Mail-Adresse.' 
                    : 'Klicke auf Anmelden, um künftig keine wichtigen Neuigkeiten mehr zu verpassen.'}
            </p>
        </div>
    );
}
