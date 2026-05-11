'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2, Check, X, Plus, GripVertical } from 'lucide-react';
import { BRAND } from '@/lib/constants';

interface Org { id: string; name: string }

export function OrgManager({ orgs: initial }: { orgs: Org[] }) {
    const router = useRouter();
    const [orgs, setOrgs] = useState<Org[]>(initial);
    const [newName, setNewName] = useState('');
    const [editId, setEditId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [busy, setBusy] = useState(false);
    const dragIdx = useRef<number | null>(null);
    const dragOverIdx = useRef<number | null>(null);

    function onDragStart(i: number) { dragIdx.current = i; }
    function onDragEnter(i: number) { dragOverIdx.current = i; }
    function onDragOver(e: React.DragEvent) { e.preventDefault(); }
    async function onDrop() {
        const from = dragIdx.current;
        const to = dragOverIdx.current;
        if (from == null || to == null || from === to) return;
        const reordered = [...orgs];
        const [moved] = reordered.splice(from, 1);
        reordered.splice(to, 0, moved);
        setOrgs(reordered);
        dragIdx.current = null;
        dragOverIdx.current = null;
        await fetch('/api/admin/orgs', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order: reordered.map(o => o.id) }),
        });
    }

    async function add() {
        if (!newName.trim()) return;
        setBusy(true);
        try {
            const res = await fetch('/api/admin/orgs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName.trim() }),
            });
            if (res.ok) {
                const org = await res.json();
                setOrgs(prev => [...prev, org]);
                setNewName('');
            } else {
                const d = await res.json();
                alert(d.error || 'Fehler beim Hinzufügen.');
            }
        } finally { setBusy(false); }
    }

    async function save(id: string) {
        if (!editName.trim()) return;
        setBusy(true);
        try {
            const res = await fetch('/api/admin/orgs', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, name: editName.trim() }),
            });
            if (res.ok) {
                setOrgs(prev => prev.map(o => o.id === id ? { ...o, name: editName.trim() } : o));
                setEditId(null);
            } else {
                const d = await res.json();
                alert(d.error || 'Fehler beim Speichern.');
            }
        } finally { setBusy(false); }
    }

    async function remove(id: string, name: string) {
        if (!confirm(`Organisation "${name}" wirklich löschen?`)) return;
        setBusy(true);
        try {
            const res = await fetch(`/api/admin/orgs?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setOrgs(prev => prev.filter(o => o.id !== id));
                router.refresh();
            }
        } finally { setBusy(false); }
    }

    function startEdit(org: Org) {
        setEditId(org.id);
        setEditName(org.name);
    }

    return (
        <div className="space-y-3">
            {/* Existing orgs */}
            <div className="space-y-2">
                {orgs.map((org, i) => (
                    <div key={org.id}
                        draggable
                        onDragStart={() => onDragStart(i)}
                        onDragEnter={() => onDragEnter(i)}
                        onDragOver={onDragOver}
                        onDrop={onDrop}
                        className="flex items-center gap-3 bg-white rounded-[8px] px-4 py-3 shadow-sm cursor-default">
                        <span className="cursor-grab text-gray-300 hover:text-gray-500 shrink-0" title="Ziehen zum Sortieren">
                            <GripVertical size={16} />
                        </span>
                        {editId === org.id ? (
                            <>
                                <input
                                    className="flex-1 text-[15px] font-bold bg-transparent outline-none border-b-2 pb-0.5"
                                    style={{ borderColor: BRAND.green, fontFamily: "'Bricolage Grotesque',sans-serif" }}
                                    value={editName}
                                    autoFocus
                                    onChange={e => setEditName(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') save(org.id); if (e.key === 'Escape') setEditId(null); }}
                                />
                                <button onClick={() => save(org.id)} disabled={busy}
                                    className="p-1.5 rounded-full hover:opacity-80 transition-opacity"
                                    style={{ backgroundColor: BRAND.green, color: '#fff' }}>
                                    <Check size={14} strokeWidth={3} />
                                </button>
                                <button onClick={() => setEditId(null)}
                                    className="p-1.5 rounded-full hover:opacity-80 transition-opacity bg-gray-100">
                                    <X size={14} />
                                </button>
                            </>
                        ) : (
                            <>
                                <span className="flex-1 text-[15px] font-bold"
                                    style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                                    {org.name}
                                </span>
                                <button onClick={() => startEdit(org)}
                                    className="p-1.5 rounded-full hover:opacity-80 transition-opacity bg-gray-100">
                                    <Pencil size={14} />
                                </button>
                                <button onClick={() => remove(org.id, org.name)} disabled={busy}
                                    className="p-1.5 rounded-full hover:opacity-80 transition-opacity"
                                    style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
                                    <Trash2 size={14} />
                                </button>
                            </>
                        )}
                    </div>
                ))}
            </div>

            {/* Add new */}
            <div className="flex gap-2 mt-4">
                <input
                    className="flex-1 h-10 px-4 rounded-full bg-white shadow-sm text-[14px] font-bold outline-none border-2 border-transparent focus:border-green-600 transition-colors"
                    style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}
                    placeholder="Neue Organisation…"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && add()}
                />
                <button onClick={add} disabled={busy || !newName.trim()}
                    className="h-10 px-5 rounded-full text-white text-[13px] font-bold flex items-center gap-2 disabled:opacity-40 transition-opacity"
                    style={{ backgroundColor: BRAND.green, fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                    <Plus size={16} strokeWidth={2.5} />
                    Hinzufügen
                </button>
            </div>
        </div>
    );
}
