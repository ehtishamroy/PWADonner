'use client';

import { useState, useRef } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { BRAND } from '@/lib/constants';

type Category = { name: string };

export function CategoryManager({ categories: initial }: { categories: Category[] }) {
    const [categories, setCategories] = useState<Category[]>(initial);
    const [newName, setNewName] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const dragIdx = useRef<number | null>(null);
    const dragOverIdx = useRef<number | null>(null);

    function onDragStart(i: number) { dragIdx.current = i; }
    function onDragEnter(i: number) { dragOverIdx.current = i; }
    function onDragOver(e: React.DragEvent) { e.preventDefault(); }
    async function onDrop() {
        const from = dragIdx.current;
        const to = dragOverIdx.current;
        if (from == null || to == null || from === to) return;
        const reordered = [...categories];
        const [moved] = reordered.splice(from, 1);
        reordered.splice(to, 0, moved);
        setCategories(reordered);
        dragIdx.current = null;
        dragOverIdx.current = null;
        await fetch('/api/admin/categories/manage', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order: reordered.map(c => c.name) }),
        });
    }

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
            setCategories(prev => [...prev, { name: data.category.name }]);
            setNewName('');
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
            if (res.ok) setCategories(prev => prev.filter(c => c.name !== name));
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
            <div className="space-y-2">
                {categories.map((cat, i) => (
                    <div key={cat.name}
                        draggable
                        onDragStart={() => onDragStart(i)}
                        onDragEnter={() => onDragEnter(i)}
                        onDragOver={onDragOver}
                        onDrop={onDrop}
                        className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-[8px] px-4 py-3 cursor-default">
                        <span className="cursor-grab text-gray-300 hover:text-gray-500 shrink-0" title="Ziehen zum Sortieren">
                            <GripVertical size={16} />
                        </span>
                        <span className="flex-1 text-[14px] font-bold" style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                            {cat.name}
                        </span>
                        <button
                            onClick={() => deleteCategory(cat.name)}
                            disabled={busy}
                            className="p-1.5 rounded-full hover:opacity-80 transition-opacity disabled:opacity-40"
                            style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}
                            title={`"${cat.name}" löschen`}
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
