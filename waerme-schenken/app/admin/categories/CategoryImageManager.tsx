'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { BRAND } from '@/lib/constants';
import { Upload, Trash2, Image as ImageIcon } from 'lucide-react';

type Item = { category: string; imageUrl: string | null };

export function CategoryImageManager({ items }: { items: Item[] }) {
    const router = useRouter();
    const [busy, setBusy] = useState<string | null>(null);

    async function upload(category: string, file: File) {
        setBusy(category);
        try {
            const fd = new FormData();
            fd.append('file', file);
            fd.append('category', category);
            const res = await fetch('/api/admin/categories', { method: 'POST', body: fd });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                alert(data.error || 'Upload fehlgeschlagen.');
            } else {
                router.refresh();
            }
        } finally {
            setBusy(null);
        }
    }

    async function remove(category: string) {
        if (!confirm(`Bild für "${category}" entfernen?`)) return;
        setBusy(category);
        try {
            const res = await fetch(
                `/api/admin/categories?category=${encodeURIComponent(category)}`,
                { method: 'DELETE' }
            );
            if (res.ok) router.refresh();
        } finally {
            setBusy(null);
        }
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map(it => (
                <Row key={it.category} item={it}
                    busy={busy === it.category}
                    onUpload={f => upload(it.category, f)}
                    onRemove={() => remove(it.category)} />
            ))}
        </div>
    );
}

function Row({ item, busy, onUpload, onRemove }: {
    item: Item; busy: boolean;
    onUpload: (f: File) => void; onRemove: () => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="bg-white rounded-[8px] p-4 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-24 h-24 shrink-0 rounded-[8px] overflow-hidden bg-gray-50 flex items-center justify-center">
                {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageUrl} alt={item.category} className="w-full h-full object-cover" />
                ) : (
                    <ImageIcon size={32} className="opacity-30" />
                )}
            </div>

            <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[16px] truncate" style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                    {item.category}
                </h3>
                <p className="text-xs opacity-60 mt-1">
                    {item.imageUrl ? 'Bild hochgeladen' : 'Kein Bild'}
                </p>
                <div className="flex gap-2 mt-3">
                    <input ref={inputRef} type="file" accept="image/*" hidden
                        onChange={e => {
                            const f = e.target.files?.[0];
                            if (f) onUpload(f);
                            e.target.value = '';
                        }} />
                    <button onClick={() => inputRef.current?.click()} disabled={busy}
                        className="h-8 px-3 rounded-full text-xs font-bold text-white flex items-center gap-1 disabled:opacity-50"
                        style={{ backgroundColor: BRAND.green, fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                        <Upload size={12} />
                        {busy ? '...' : item.imageUrl ? 'Ersetzen' : 'Hochladen'}
                    </button>
                    {item.imageUrl && (
                        <button onClick={onRemove} disabled={busy}
                            className="h-8 px-3 rounded-full text-xs font-bold border-2 flex items-center gap-1 disabled:opacity-50"
                            style={{ borderColor: BRAND.error, color: BRAND.error, fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                            <Trash2 size={12} />
                            Entfernen
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
