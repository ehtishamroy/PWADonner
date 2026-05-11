'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BRAND } from '@/lib/constants';

function toLocalInput(iso: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function ScheduleForm({ openDate: initOpen, closeDate: initClose, isOpen: initIsOpen }: { openDate: string; closeDate: string; isOpen: boolean }) {
    const router = useRouter();
    const [open,  setOpen]  = useState(initOpen);
    const [close, setClose] = useState(initClose);
    const [saving, setSaving] = useState(false);
    const [saved,  setSaved]  = useState(false);
    const [error,  setError]  = useState('');

    async function patch(body: { openDate: string | null; closeDate: string | null }) {
        setError(''); setSaving(true); setSaved(false);
        try {
            const res = await fetch('/api/admin/shop-schedule', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (!res.ok) { const d = await res.json(); setError(d.error || 'Fehler'); return; }
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
            router.refresh();
        } finally { setSaving(false); }
    }

    async function save() {
        await patch({
            openDate:  open  ? new Date(open).toISOString()  : null,
            closeDate: close ? new Date(close).toISOString() : null,
        });
    }

    async function openNow() {
        const now = new Date().toISOString();
        setOpen(toLocalInput(now));
        setClose('');
        await patch({ openDate: now, closeDate: null });
    }

    async function closeNow() {
        const now = new Date().toISOString();
        setClose(toLocalInput(now));
        await patch({
            openDate:  open  ? new Date(open).toISOString()  : null,
            closeDate: now,
        });
    }

    return (
        <div className="space-y-6">
            {/* Quick toggle */}
            <div className="flex gap-3">
                <button onClick={openNow} disabled={saving || initIsOpen}
                    className="h-11 px-6 rounded-full text-white shadow-sm active:scale-95 disabled:opacity-40 transition-all"
                    style={{ backgroundColor: BRAND.green, fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: '13px', letterSpacing: '0.1em' }}>
                    JETZT ÖFFNEN
                </button>
                <button onClick={closeNow} disabled={saving || !initIsOpen}
                    className="h-11 px-6 rounded-full text-white shadow-sm active:scale-95 disabled:opacity-40 transition-all"
                    style={{ backgroundColor: BRAND.error, fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: '13px', letterSpacing: '0.1em' }}>
                    JETZT SCHLIESSEN
                </button>
            </div>

            {/* Scheduled dates */}
            <div className="bg-white rounded-[8px] p-6 md:p-8 shadow-sm border border-gray-100 space-y-6">
                <div>
                    <label className="block mb-2 text-xs font-bold uppercase tracking-widest opacity-50"
                        style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>Öffnungsdatum</label>
                    <input type="datetime-local" value={open} onChange={e => setOpen(e.target.value)}
                        className="w-full border-2 border-gray-100 rounded-[8px] p-3 text-[15px] outline-none focus:border-gray-300" />
                </div>
                <div>
                    <label className="block mb-2 text-xs font-bold uppercase tracking-widest opacity-50"
                        style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>Schliessdatum</label>
                    <input type="datetime-local" value={close} onChange={e => setClose(e.target.value)}
                        className="w-full border-2 border-gray-100 rounded-[8px] p-3 text-[15px] outline-none focus:border-gray-300" />
                </div>
                {error && <p className="text-[13px]" style={{ color: BRAND.error }}>{error}</p>}
                <div className="flex gap-3 items-center">
                    <button onClick={save} disabled={saving}
                        className="h-10 px-6 rounded-full text-white shadow-sm active:scale-95 disabled:opacity-40"
                        style={{ backgroundColor: BRAND.green, fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: '13px', letterSpacing: '0.1em' }}>
                        {saving ? 'SPEICHERN...' : 'SPEICHERN'}
                    </button>
                    {saved && <span className="text-sm" style={{ color: BRAND.green }}>Gespeichert ✓</span>}
                </div>
            </div>
        </div>
    );
}
