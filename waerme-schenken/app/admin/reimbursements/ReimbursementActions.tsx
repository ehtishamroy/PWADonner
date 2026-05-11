'use client';

import { useState } from 'react';
import { BRAND } from '@/lib/constants';
import { Loader2, Trash2 } from 'lucide-react';

export function ReimbursementActions({ id, onUpdate }: { id: string; onUpdate: () => void }) {
    const [loading, setLoading] = useState<string | null>(null);

    async function act(action: string) {
        setLoading(action);
        try {
            await fetch(`/api/admin/reimbursements/${id}/${action}`, { method: 'POST' });
            onUpdate();
        } finally {
            setLoading(null);
        }
    }

    async function deleteRecord() {
        if (!confirm('Diesen Erstattungsantrag wirklich vollständig löschen?')) return;
        setLoading('delete');
        try {
            await fetch(`/api/admin/reimbursements/${id}/delete`, { method: 'POST' });
            onUpdate();
        } finally {
            setLoading(null);
        }
    }

    return (
        <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t">
            <button
                onClick={() => act('approve')}
                disabled={!!loading}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
                {loading === 'approve' && <Loader2 size={14} className="animate-spin" />}
                Genehmigen
            </button>
            <button
                onClick={() => act('pay')}
                disabled={!!loading}
                className="px-4 py-2 rounded-lg font-bold text-sm disabled:opacity-50 flex items-center gap-2"
                style={{ backgroundColor: BRAND.green, color: 'white' }}
            >
                {loading === 'pay' && <Loader2 size={14} className="animate-spin" />}
                Als bezahlt markieren
            </button>
            <button
                onClick={() => act('reject')}
                disabled={!!loading}
                className="px-4 py-2 rounded-lg bg-red-100 text-red-700 font-bold text-sm hover:bg-red-200 disabled:opacity-50 flex items-center gap-2"
            >
                {loading === 'reject' && <Loader2 size={14} className="animate-spin" />}
                Ablehnen
            </button>
            <button
                onClick={deleteRecord}
                disabled={!!loading}
                className="ml-auto px-4 py-2 rounded-lg bg-gray-900 text-white font-bold text-sm hover:bg-black disabled:opacity-50 flex items-center gap-2"
            >
                {loading === 'delete' ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Löschen
            </button>
        </div>
    );
}
