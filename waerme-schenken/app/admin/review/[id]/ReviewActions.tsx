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
                    className="mx-auto h-10 min-w-[200px] px-6 rounded-full font-bold uppercase tracking-widest text-[11px] transition-transform active:scale-95 disabled:opacity-50 border-2 flex items-center justify-center"
                    style={{ borderColor: BRAND.mustard, color: BRAND.mustard, fontFamily: "'Bricolage Grotesque', sans-serif" }}
                >
                    {loading ? 'Warten...' : 'Freigabe zurückziehen'}
                </button>
                <div className="flex gap-3 justify-center">
                    <button
                        onClick={() => handleAction('rejected')}
                        disabled={loading}
                        className="h-10 min-w-[110px] px-4 rounded-full font-bold uppercase tracking-widest text-[11px] transition-transform active:scale-95 disabled:opacity-50 border-2 flex items-center justify-center"
                        style={{ borderColor: BRAND.error, color: BRAND.error, fontFamily: "'Bricolage Grotesque', sans-serif" }}
                    >
                        Ablehnen
                    </button>
                    <button
                        onClick={() => handleAction('deleted')}
                        disabled={loading}
                        className="h-10 min-w-[110px] px-4 rounded-full font-bold uppercase tracking-widest text-[11px] transition-transform active:scale-95 disabled:opacity-50 text-white flex items-center justify-center"
                        style={{ backgroundColor: BRAND.error, fontFamily: "'Bricolage Grotesque', sans-serif" }}
                    >
                        Löschen
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
                onClick={() => handleAction('approved')}
                disabled={loading}
                className="h-10 min-w-[143px] px-6 rounded-[8px] text-white font-bold uppercase tracking-widest text-[12px] transition-transform active:scale-95 disabled:opacity-50 flex items-center justify-center"
                style={{ backgroundColor: BRAND.green, fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
                {loading ? 'Warten...' : 'Freischalten'}
            </button>
            <button
                onClick={() => handleAction('rejected')}
                disabled={loading}
                className="h-10 min-w-[110px] px-4 rounded-full font-bold uppercase tracking-widest text-[12px] transition-transform active:scale-95 disabled:opacity-50 border-2 flex items-center justify-center"
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
                className="h-10 min-w-[110px] px-4 rounded-full font-bold uppercase tracking-widest text-[12px] transition-transform active:scale-95 disabled:opacity-50 text-white flex items-center justify-center"
                style={{ backgroundColor: BRAND.error, fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
                Löschen
            </button>
        </div>
    );
}
