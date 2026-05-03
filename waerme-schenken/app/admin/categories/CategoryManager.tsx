'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';
import { BRAND } from '@/lib/constants';

type Category = { name: string };

export function CategoryManager({ categories }: { categories: Category[] }) {
    const router = useRouter();
    const [newName, setNewName] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    async function addCategory() {
        const name = newName.trim();
        if (!name) return;
        setBusy(true);
        setError('');
        try {
            const res = await fetch('/api/admin/categories/manage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || 'Fehler'); return; }
            setNewName('');
            router.refresh();
        } finally {
            setBusy(false);
        }
    }

    async function deleteCategory(name: string) {
        if (!confirm(`Kategorie "${name}" löschen? Auch das zugehörige Bild wird entfernt.`)) return;
        setBusy(true);
        setError('');
        try {
            const res = await fetch(`/api/admin/categories/manage?name=${encodeURIComponent(name)}`, {
                method: 'DELETE',
            });
            if (res.ok) router.refresh();
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="bg-white rounded-[8px] p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-[16px] mb-4" style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                Kategorien verwalten
            </h3>

            {/* Add new */}
            <div className="flex gap-2 mb-5">
                <input
                    type="text"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addCategory()}
                    placeholder="Neue Kategorie…"
                    className="flex-1 h-10 px-4 rounded-full border-2 border-gray-200 outline-none text-[14px] font-medium focus:border-[#537D61] transition-colors"
                    style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}
                />
                <button
                    onClick={addCategory}
                    disabled={busy || !newName.trim()}
                    className="h-10 px-5 rounded-full text-white font-bold text-[13px] flex items-center gap-1.5 disabled:opacity-40 transition-all active:scale-95"
                    style={{ backgroundColor: BRAND.green, fontFamily: "'Bricolage Grotesque',sans-serif" }}
                >
                    <Plus size={15} />
                    Hinzufügen
                </button>
            </div>
            {error && <p className="text-[12px] font-medium mb-3" style={{ color: BRAND.error }}>{error}</p>}

            {/* Category list */}
            <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                    <div key={cat.name}
                        className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-4 py-1.5">
                        <span className="text-[13px] font-medium" style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                            {cat.name}
                        </span>
                        <button
                            onClick={() => deleteCategory(cat.name)}
                            disabled={busy}
                            className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-40"
                            title={`"${cat.name}" löschen`}
                        >
                            <Trash2 size={13} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
