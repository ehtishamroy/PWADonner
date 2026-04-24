'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BRAND } from '@/lib/constants';

type Banner = { id: string; title: string; body: string; isActive: boolean } | null;

export function BannerForm({ initial }: { initial: Banner }) {
    const router = useRouter();
    const [title, setTitle]   = useState(initial?.title || '');
    const [body,  setBody]    = useState(initial?.body  || '');
    const [active, setActive] = useState(initial?.isActive || false);
    const [saving, setSaving] = useState(false);
    const [saved,  setSaved]  = useState(false);

    async function save() {
        setSaving(true); setSaved(false);
        try {
            const res = await fetch('/api/admin/banner', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, body, isActive: active }),
            });
            if (res.ok) {
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
                router.refresh();
            }
        } finally { setSaving(false); }
    }

    return (
        <div className="bg-white rounded-[8px] p-6 md:p-8 shadow-sm border border-gray-100 space-y-6">
            <div>
                <label className="block mb-2 text-xs font-bold uppercase tracking-widest opacity-50"
                    style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>Titel</label>
                <input value={title} onChange={e => setTitle(e.target.value)}
                    className="w-full border-b-2 border-gray-200 pb-2 font-bold text-lg outline-none" />
            </div>

            <div>
                <label className="block mb-2 text-xs font-bold uppercase tracking-widest opacity-50"
                    style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>Text</label>
                <textarea value={body} rows={4} onChange={e => setBody(e.target.value)}
                    className="w-full border-2 border-gray-100 rounded-[8px] p-3 text-[15px] outline-none focus:border-gray-300" />
            </div>

            <div className="flex items-center gap-4">
                <button onClick={() => setActive(a => !a)}
                    className="relative w-14 h-8 rounded-full transition-colors"
                    style={{ backgroundColor: active ? BRAND.green : '#D1D5DB' }}>
                    <span className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform"
                        style={{ left: active ? 'calc(100% - 28px)' : '4px' }} />
                </button>
                <span className="font-bold text-sm" style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                    {active ? 'Veröffentlicht' : 'Versteckt'}
                </span>
            </div>

            <div className="flex gap-3 items-center pt-2">
                <button onClick={save} disabled={saving || !title.trim()}
                    className="h-10 px-6 rounded-full text-white shadow-sm active:scale-95 disabled:opacity-40"
                    style={{ backgroundColor: BRAND.green, fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: '13px', letterSpacing: '0.1em' }}>
                    {saving ? 'SPEICHERN...' : 'SPEICHERN'}
                </button>
                {saved && <span className="text-sm" style={{ color: BRAND.green }}>Gespeichert ✓</span>}
            </div>

            {/* Preview */}
            {title && (
                <div className="mt-8 pt-8 border-t border-gray-100">
                    <p className="text-xs font-bold uppercase tracking-widest opacity-40 mb-3"
                        style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>Vorschau</p>
                    <div className="rounded-[8px] p-6 shadow-sm" style={{ backgroundColor: BRAND.lila }}>
                        <h3 className="font-bold mb-1" style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: '20px' }}>
                            {title}
                        </h3>
                        <p className="text-[14px] opacity-80 leading-relaxed whitespace-pre-line">{body}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
