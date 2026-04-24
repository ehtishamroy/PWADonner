'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BRAND } from '@/lib/constants';

export function ScheduleForm({ openDate: initOpen, closeDate: initClose }: { openDate: string; closeDate: string }) {
    const router = useRouter();
    const [open,  setOpen]  = useState(initOpen);
    const [close, setClose] = useState(initClose);
    const [saving, setSaving] = useState(false);
    const [saved,  setSaved]  = useState(false);
    const [error,  setError]  = useState('');

    async function save() {
        setError(''); setSaving(true); setSaved(false);
        try {
            const res = await fetch('/api/admin/shop-schedule', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    openDate:  open  ? new Date(open).toISOString()  : null,
                    closeDate: close ? new Date(close).toISOString() : null,
                }),
            });
            if (!res.ok) { const d = await res.json(); setError(d.error || 'Fehler'); return; }
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
            router.refresh();
        } finally { setSaving(false); }
    }

    return (
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
    );
}
