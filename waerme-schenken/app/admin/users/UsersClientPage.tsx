'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BRAND } from '@/lib/constants';
import { Download, Mail, Trash2, Users } from 'lucide-react';

type User = {
    id:                string;
    firstName:         string;
    lastName:          string;
    email:             string;
    role:              string;
    newsletterConsent: boolean;
    createdAt:         string;
};

type Props = {
    users:            User[];
    filter:           'all' | 'newsletter';
    page:             number;
    totalAll:         number;
    totalNewsletter:  number;
    totalFiltered:    number;
    pageSize:         number;
};

export function UsersClientPage({ users, filter, page, totalAll, totalNewsletter, totalFiltered, pageSize }: Props) {
    const router = useRouter();
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deleteError, setDeleteError] = useState('');

    const totalPages = Math.ceil(totalFiltered / pageSize);
    function pageUrl(p: number) { return `/admin/users?filter=${filter}&page=${p}`; }

    function downloadCsv() {
        window.location.href = `/api/admin/users?filter=${filter}&format=csv`;
    }

    async function deleteUser(user: User) {
        if (user.role === 'admin') return;
        if (!confirm(`Diesen Nutzer wirklich löschen?\n${user.firstName} ${user.lastName} (${user.email})`)) return;

        setDeleteError('');
        setDeletingId(user.id);
        try {
            const res = await fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' });
            if (!res.ok) {
                let message = 'Löschen fehlgeschlagen.';
                try {
                    const data = await res.json();
                    if (data?.error) message = data.error;
                } catch {
                    // ignore JSON parse errors
                }
                setDeleteError(message);
                return;
            }
            router.refresh();
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <>
            {/* Page header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold mb-1" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                        Nutzerliste
                    </h2>
                    <p className="text-sm opacity-50">E-Mail-Adressen aller registrierten Nutzer</p>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 flex-wrap">
                    <button
                        onClick={downloadCsv}
                        className="flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-bold transition-opacity hover:opacity-90"
                        style={{ backgroundColor: BRAND.green }}
                    >
                        <Download size={15} />
                        CSV exportieren
                    </button>
                </div>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white rounded-[20px] p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-1">
                        <Users size={18} className="opacity-40" />
                        <span className="text-xs font-bold uppercase tracking-widest opacity-40" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>Alle Nutzer</span>
                    </div>
                    <p className="text-3xl font-bold" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>{totalAll}</p>
                </div>
                <div className="bg-white rounded-[20px] p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-1">
                        <Mail size={18} className="opacity-40" />
                        <span className="text-xs font-bold uppercase tracking-widest opacity-40" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>Newsletter</span>
                    </div>
                    <p className="text-3xl font-bold" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>{totalNewsletter}</p>
                </div>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-6 border-b border-gray-200 pb-px mb-6">
                <Link
                    href="/admin/users?filter=all"
                    className="pb-3 font-bold uppercase tracking-widest text-sm transition-colors border-b-2"
                    style={{
                        fontFamily:  "'Bricolage Grotesque', sans-serif",
                        borderColor: filter === 'all' ? BRAND.green : 'transparent',
                        color:       filter === 'all' ? BRAND.green : undefined,
                        opacity:     filter === 'all' ? 1 : 0.4,
                    }}
                >
                    Alle ({totalAll})
                </Link>
                <Link
                    href="/admin/users?filter=newsletter"
                    className="pb-3 font-bold uppercase tracking-widest text-sm transition-colors border-b-2"
                    style={{
                        fontFamily:  "'Bricolage Grotesque', sans-serif",
                        borderColor: filter === 'newsletter' ? BRAND.green : 'transparent',
                        color:       filter === 'newsletter' ? BRAND.green : undefined,
                        opacity:     filter === 'newsletter' ? 1 : 0.4,
                    }}
                >
                    Newsletter ({totalNewsletter})
                </Link>
            </div>

            {/* Table */}
            {users.length === 0 ? (
                <div className="bg-white rounded-[24px] p-12 text-center shadow-sm border border-gray-100">
                    <div className="text-4xl mb-4 opacity-30">📭</div>
                    <p className="opacity-60 font-medium">Keine Nutzer gefunden.</p>
                </div>
            ) : (
                <>
                    {deleteError && (
                        <div className="mb-4 mx-1 px-4 py-2 rounded-[12px] text-sm font-medium" style={{ backgroundColor: '#FEE2E2', color: '#B91C1C' }}>
                            {deleteError}
                        </div>
                    )}
                    <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-widest opacity-40" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>Name</th>
                                    <th className="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-widest opacity-40" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>E-Mail</th>
                                    <th className="text-center px-6 py-4 text-[11px] font-bold uppercase tracking-widest opacity-40" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>Typ</th>
                                    <th className="text-center px-6 py-4 text-[11px] font-bold uppercase tracking-widest opacity-40 hidden md:table-cell" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>Newsletter</th>
                                    <th className="text-right px-6 py-4 text-[11px] font-bold uppercase tracking-widest opacity-40 hidden md:table-cell" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>Registriert</th>
                                    <th className="text-right px-6 py-4 text-[11px] font-bold uppercase tracking-widest opacity-40" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>Aktion</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-6 py-3.5 font-bold">
                                            {user.firstName} {user.lastName}
                                        </td>
                                        <td className="px-6 py-3.5">
                                            <a
                                                href={`mailto:${user.email}`}
                                                className="hover:underline"
                                                style={{ color: BRAND.green }}
                                            >
                                                {user.email}
                                            </a>
                                        </td>
                                        <td className="px-6 py-3.5 text-center">
                                            {user.role === 'donor' ? (
                                                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: BRAND.green }}>Spender</span>
                                            ) : user.role === 'family' ? (
                                                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: BRAND.mustard }}>Familie</span>
                                            ) : (
                                                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 opacity-50">{user.role}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-3.5 text-center hidden md:table-cell">
                                            {user.newsletterConsent ? (
                                                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: BRAND.green }}>Ja</span>
                                            ) : (
                                                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 opacity-50">Nein</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-3.5 text-right text-xs opacity-50 hidden md:table-cell">
                                            {new Date(user.createdAt).toLocaleDateString('de-CH')}
                                        </td>
                                        <td className="px-6 py-3.5 text-right">
                                            {user.role === 'admin' ? (
                                                <span className="text-[11px] font-bold opacity-40">Admin</span>
                                            ) : (
                                                <button
                                                    onClick={() => deleteUser(user)}
                                                    disabled={!!deletingId}
                                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 hover:text-red-800 disabled:opacity-40"
                                                >
                                                    <Trash2 size={14} />
                                                    Löschen
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                    <p className="text-sm opacity-50">
                        {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalFiltered)} von {totalFiltered}
                    </p>
                    <div className="flex gap-2">
                        <Link
                            href={pageUrl(page - 1)}
                            aria-disabled={page <= 1}
                            className={`px-4 py-2 rounded-full text-sm font-bold border-2 transition-opacity ${page <= 1 ? 'opacity-30 pointer-events-none' : 'hover:opacity-80'}`}
                            style={{ borderColor: BRAND.green, color: BRAND.green }}
                        >
                            ← Zurück
                        </Link>
                        <span className="px-4 py-2 text-sm font-bold opacity-50">{page} / {totalPages}</span>
                        <Link
                            href={pageUrl(page + 1)}
                            aria-disabled={page >= totalPages}
                            className={`px-4 py-2 rounded-full text-sm font-bold border-2 transition-opacity ${page >= totalPages ? 'opacity-30 pointer-events-none' : 'hover:opacity-80'}`}
                            style={{ borderColor: BRAND.green, color: BRAND.green }}
                        >
                            Weiter →
                        </Link>
                    </div>
                </div>
            )}
        </>
    );
}
