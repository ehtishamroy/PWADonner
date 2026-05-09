'use client';

import { useEffect, useState, useCallback } from 'react';
import { AdminHeader } from '../components/AdminHeader';
import { BRAND } from '@/lib/constants';
import { CheckCircle2, Clock, Ban, Loader2 } from 'lucide-react';

type ReimbursementItem = {
    id: string;
    amount: number;
    status: string;
    createdAt: string;
    donor: { firstName: string; lastName: string; email: string; phoneNumber?: string | null };
    donation: { toyName: string };
    images: { id: string; imageUrl: string }[];
};

function ReimbursementCard({ r, onUpdate }: { r: ReimbursementItem; onUpdate: () => void }) {
    const [loading, setLoading] = useState<string | null>(null);

    async function act(action: string) {
        setLoading(action);
        try {
            await fetch(`/api/admin/reimbursements/${r.id}/${action}`, { method: 'POST' });
            onUpdate();
        } finally {
            setLoading(null);
        }
    }

    const statusConfig: Record<string, { label: string; color: string; Icon: typeof Clock }> = {
        pending:  { label: 'Ausstehend', color: 'bg-yellow-100 text-yellow-700', Icon: Clock },
        approved: { label: 'Genehmigt',  color: 'bg-blue-100 text-blue-700',   Icon: CheckCircle2 },
        paid:     { label: 'Bezahlt',    color: 'bg-green-100 text-green-700',  Icon: CheckCircle2 },
        rejected: { label: 'Abgelehnt', color: 'bg-red-100 text-red-700',      Icon: Ban },
    };
    const cfg = statusConfig[r.status] || statusConfig.pending;
    const Icon = cfg.Icon;

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="font-bold text-lg">{r.donation?.toyName || 'Spende'}</p>
                    <p className="text-sm opacity-70">Von: {r.donor?.firstName} {r.donor?.lastName} ({r.donor?.email})</p>
                    {r.donor?.phoneNumber && (
                        <p className="text-sm font-bold mt-1" style={{ color: BRAND.green }}>📱 Twint: {r.donor.phoneNumber}</p>
                    )}
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold">CHF {r.amount.toFixed(2)}</p>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold mt-2 ${cfg.color}`}>
                        <Icon size={14} />{cfg.label}
                    </span>
                </div>
            </div>

            {r.images.length > 0 && (
                <div className="flex gap-3 mb-4">
                    {r.images.map(img => (
                        <a key={img.id} href={img.imageUrl} target="_blank" rel="noopener noreferrer"
                           className="w-24 h-24 rounded-lg bg-gray-100 overflow-hidden hover:opacity-80">
                            <img src={img.imageUrl} alt="Quittung" className="w-full h-full object-cover" />
                        </a>
                    ))}
                </div>
            )}

            {r.status === 'pending' && (
                <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t">
                    <button onClick={() => act('approve')} disabled={!!loading}
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
                        {loading === 'approve' && <Loader2 size={14} className="animate-spin" />} Genehmigen
                    </button>
                    <button onClick={() => act('pay')} disabled={!!loading}
                        className="px-4 py-2 rounded-lg font-bold text-sm disabled:opacity-50 flex items-center gap-2"
                        style={{ backgroundColor: BRAND.green, color: 'white' }}>
                        {loading === 'pay' && <Loader2 size={14} className="animate-spin" />} Als bezahlt markieren
                    </button>
                    <button onClick={() => act('reject')} disabled={!!loading}
                        className="px-4 py-2 rounded-lg bg-red-100 text-red-700 font-bold text-sm hover:bg-red-200 disabled:opacity-50 flex items-center gap-2">
                        {loading === 'reject' && <Loader2 size={14} className="animate-spin" />} Ablehnen
                    </button>
                </div>
            )}

            {r.status === 'approved' && (
                <div className="flex gap-3 mt-4 pt-4 border-t">
                    <button onClick={() => act('pay')} disabled={!!loading}
                        className="px-4 py-2 rounded-lg font-bold text-sm disabled:opacity-50 flex items-center gap-2"
                        style={{ backgroundColor: BRAND.green, color: 'white' }}>
                        {loading === 'pay' && <Loader2 size={14} className="animate-spin" />} Als bezahlt markieren
                    </button>
                </div>
            )}

            <p className="text-xs opacity-50 mt-4">Antrag vom {new Date(r.createdAt).toLocaleDateString('de-CH')}</p>
        </div>
    );
}

export default function AdminReimbursementsPage() {
    const [reimbursements, setReimbursements] = useState<ReimbursementItem[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(() => {
        setLoading(true);
        fetch('/api/admin/reimbursements')
            .then(r => r.json())
            .then(d => { setReimbursements(d.reimbursements || []); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    useEffect(() => { load(); }, [load]);

    const pending  = reimbursements.filter(r => r.status === 'pending');
    const approved = reimbursements.filter(r => r.status === 'approved');
    const others   = reimbursements.filter(r => r.status !== 'pending' && r.status !== 'approved');
    const totalPaid = reimbursements.filter(r => r.status === 'paid').reduce((s, r) => s + r.amount, 0);

    return (
        <>
            <AdminHeader />
            <main className="max-w-5xl mx-auto p-6 md:p-10">
                <h1 className="text-3xl font-bold mb-8" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                    Versandkosten-Erstattungen
                </h1>

                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin opacity-40" /></div>
                ) : (
                    <>
                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            <div className="bg-yellow-50 rounded-xl p-4">
                                <p className="text-2xl font-bold">{pending.length}</p>
                                <p className="text-sm opacity-70">Ausstehend</p>
                            </div>
                            <div className="bg-blue-50 rounded-xl p-4">
                                <p className="text-2xl font-bold">{approved.length}</p>
                                <p className="text-sm opacity-70">Genehmigt</p>
                            </div>
                            <div className="bg-green-50 rounded-xl p-4">
                                <p className="text-2xl font-bold">{reimbursements.filter(r => r.status === 'paid').length}</p>
                                <p className="text-sm opacity-70">Bezahlt</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4">
                                <p className="text-2xl font-bold">CHF {totalPaid.toFixed(2)}</p>
                                <p className="text-sm opacity-70">Total bezahlt</p>
                            </div>
                        </div>

                        {reimbursements.length === 0 && (
                            <div className="text-center py-20 opacity-50">Keine Erstattungsanträge</div>
                        )}

                        {pending.length > 0 && (
                            <div className="mb-10">
                                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <Clock size={20} className="text-yellow-600" /> Ausstehende Anträge
                                </h2>
                                <div className="space-y-4">
                                    {pending.map(r => <ReimbursementCard key={r.id} r={r} onUpdate={load} />)}
                                </div>
                            </div>
                        )}

                        {approved.length > 0 && (
                            <div className="mb-10">
                                <h2 className="text-xl font-bold mb-4">Genehmigte Anträge</h2>
                                <div className="space-y-4">
                                    {approved.map(r => <ReimbursementCard key={r.id} r={r} onUpdate={load} />)}
                                </div>
                            </div>
                        )}

                        {others.length > 0 && (
                            <div>
                                <h2 className="text-xl font-bold mb-4">Bearbeitete Anträge</h2>
                                <div className="space-y-4">
                                    {others.map(r => <ReimbursementCard key={r.id} r={r} onUpdate={load} />)}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>
        </>
    );
}
