'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BRAND } from '@/lib/constants';

type Family = {
    id: string; firstName: string; lastName: string; email: string;
    street: string | null; city: string | null; zipCode: string | null;
    socialCardUrl: string | null; socialCardOrg: string | null;
    familyApproved: boolean; familySpecial: boolean; createdAt: string;
};

export function FamilyRow({ family }: { family: Family }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [zoom, setZoom] = useState(false);

    async function patchFamily(payload: Record<string, boolean>) {
        setLoading(true);
        await fetch(`/api/admin/families/${family.id}/approve`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        setLoading(false);
        router.refresh();
    }

    const approve       = () => patchFamily({ approve: true });
    const revoke        = () => patchFamily({ approve: false });
    const markSpecial   = () => patchFamily({ special: true });
    const unmarkSpecial = () => patchFamily({ special: false });

    return (
        <>
            <div className="bg-white rounded-[8px] p-5 shadow-sm border border-gray-100 flex gap-5">
                {/* Social card thumbnail */}
                {family.socialCardUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={family.socialCardUrl} alt="Sozialausweis"
                        onClick={() => setZoom(true)}
                        className="w-28 h-28 object-cover rounded-[8px] cursor-zoom-in shrink-0 border border-gray-100" />
                ) : (
                    <div className="w-28 h-28 rounded-[8px] bg-gray-100 flex items-center justify-center text-xs opacity-40 shrink-0">
                        Kein Bild
                    </div>
                )}

                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[16px] flex items-center gap-2" style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                        {family.firstName} {family.lastName}
                        {family.familySpecial && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                                style={{ backgroundColor: BRAND.lila || '#e8e0f0', color: '#000', opacity: 0.8 }}>
                                Spezial
                            </span>
                        )}
                    </h3>
                    <p className="text-[13px] opacity-60 mb-1">{family.email}</p>
                    {family.street && (
                        <p className="text-[13px] opacity-80">
                            {family.street}, {family.zipCode} {family.city}
                        </p>
                    )}
                    {family.socialCardOrg && (
                        <p className="text-[12px] mt-2">
                            <span className="opacity-50">Organisation:</span>{' '}
                            <strong>{family.socialCardOrg}</strong>
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                    {family.familyApproved ? (
                        <button onClick={revoke} disabled={loading}
                            className="h-9 px-4 rounded-full text-sm font-bold border-2 disabled:opacity-50"
                            style={{ borderColor: BRAND.error, color: BRAND.error, fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                            {loading ? '...' : 'Freigabe entziehen'}
                        </button>
                    ) : (
                        <button onClick={approve} disabled={loading}
                            className="h-9 px-4 rounded-full text-sm font-bold text-white disabled:opacity-50"
                            style={{ backgroundColor: BRAND.green, fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                            {loading ? '...' : 'Freigeben'}
                        </button>
                    )}
                    {family.familySpecial ? (
                        <button onClick={unmarkSpecial} disabled={loading}
                            className="h-9 px-4 rounded-full text-sm font-bold border-2 disabled:opacity-50"
                            style={{ borderColor: '#8b7bb8', color: '#8b7bb8', fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                            {loading ? '...' : 'Spezial entfernen'}
                        </button>
                    ) : (
                        <button onClick={markSpecial} disabled={loading}
                            className="h-9 px-4 rounded-full text-sm font-bold border-2 disabled:opacity-50"
                            style={{ borderColor: '#8b7bb8', color: '#8b7bb8', fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                            {loading ? '...' : 'Als Spezial markieren'}
                        </button>
                    )}
                </div>
            </div>

            {zoom && family.socialCardUrl && (
                <div onClick={() => setZoom(false)}
                    className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center cursor-zoom-out p-6">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={family.socialCardUrl} alt="Sozialausweis"
                        className="max-w-full max-h-full rounded-[8px]" />
                </div>
            )}
        </>
    );
}
