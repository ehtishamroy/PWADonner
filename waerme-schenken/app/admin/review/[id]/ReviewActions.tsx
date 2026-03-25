'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { BRAND } from '@/lib/constants';

export default function ReviewActions({ params, currentStatus }: { params: Promise<{ id: string }>; currentStatus: string }) {
    const { id } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function handleAction(status: 'approved' | 'rejected' | 'waiting' | 'deleted') {
        const actionName = {
            approved: 'freischalten',
            rejected: 'ablehnen',
            waiting: 'zurück auf "Warten" setzen',
            deleted: 'komplett löschen'
        }[status];

        const confirmed = confirm(`Spende wirklich ${actionName}?`);
        if (!confirmed) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/admin/donations/${id}`, {
                method: status === 'deleted' ? 'DELETE' : 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: status === 'deleted' ? undefined : JSON.stringify({ status }),
            });

            if (!res.ok) {
                alert('Ein Fehler ist aufgetreten.');
                setLoading(false);
                return;
            }

            // Go back to dashboard queue
            router.push('/admin/dashboard');
            router.refresh();
        } catch {
            alert('Netzwerkfehler');
            setLoading(false);
        }
    }

    if (currentStatus === 'approved') {
        return (
            <div className="flex flex-col gap-3">
                <button
                    onClick={() => handleAction('waiting')}
                    disabled={loading}
                    className="w-full py-4 rounded-full font-bold uppercase tracking-widest text-sm transition-transform active:scale-95 disabled:opacity-50 border-2"
                    style={{ borderColor: BRAND.mustard, color: BRAND.mustard, fontFamily: "'Bricolage Grotesque', sans-serif" }}
                >
                    {loading ? 'Warten...' : 'Freigabe zurückziehen'}
                </button>
                <div className="flex gap-3">
                    <button
                        onClick={() => handleAction('rejected')}
                        disabled={loading}
                        className="flex-1 py-4 rounded-full font-bold uppercase tracking-widest text-sm transition-transform active:scale-95 disabled:opacity-50 border-2"
                        style={{ borderColor: BRAND.error, color: BRAND.error, fontFamily: "'Bricolage Grotesque', sans-serif" }}
                    >
                        Ablehnen
                    </button>
                    <button
                        onClick={() => handleAction('deleted')}
                        disabled={loading}
                        className="flex-1 py-4 rounded-full font-bold uppercase tracking-widest text-sm transition-transform active:scale-95 disabled:opacity-50 text-white"
                        style={{ backgroundColor: BRAND.error, fontFamily: "'Bricolage Grotesque', sans-serif" }}
                    >
                        Löschen
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col sm:flex-row gap-4">
            <button
                onClick={() => handleAction('approved')}
                disabled={loading}
                className="flex-[2] py-4 rounded-full text-white font-bold uppercase tracking-widest text-sm transition-transform active:scale-95 disabled:opacity-50"
                style={{ backgroundColor: BRAND.green, fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
                {loading ? 'Warten...' : 'Freischalten'}
            </button>
            <button
                onClick={() => handleAction('rejected')}
                disabled={loading}
                className="flex-1 py-4 rounded-full font-bold uppercase tracking-widest text-sm transition-transform active:scale-95 disabled:opacity-50 border-2"
                style={{ 
                    backgroundColor: 'transparent',
                    color: BRAND.error,
                    borderColor: BRAND.error,
                    fontFamily: "'Bricolage Grotesque', sans-serif" 
                }}
            >
                Ablehnen
            </button>
            <button
                onClick={() => handleAction('deleted')}
                disabled={loading}
                className="flex-1 py-4 rounded-full font-bold uppercase tracking-widest text-sm transition-transform active:scale-95 disabled:opacity-50 text-white"
                style={{ backgroundColor: BRAND.error, fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
                Löschen
            </button>
        </div>
    );
}
