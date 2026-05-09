'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { de } from '@/lib/i18n/de';
import { BRAND } from '@/lib/constants';

interface Props {
    donationId: string;
    status: string;
    trackingNumber?: string | null;
}

export function DonationActions({ donationId, status, trackingNumber: initialTracking }: Props) {
    const router = useRouter();
    const [deleting, setDeleting] = useState(false);
    const [confirm,  setConfirm]  = useState(false);

    async function deleteDonation() {
        setDeleting(true);
        await fetch(`/api/donations/${donationId}`, { method: 'DELETE' });
        router.replace('/donor/dashboard');
    }

    if (status === 'sent') {
        return (
            <div className="px-5 mt-6">
                <div className="bg-white rounded-[20px] p-5 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-widest opacity-40 mb-2"
                        style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                        {de.donationDetail.trackingNumber}
                    </p>
                    {initialTracking ? (
                        <p className="font-mono text-[15px] font-bold">{initialTracking}</p>
                    ) : (
                        <p className="text-[14px] opacity-40">Keine Tracking-Nummer</p>
                    )}
                </div>
            </div>
        );
    }

    // For 'selected' status — only show the "Can't find" delete link
    if (status === 'selected') {
        return (
            <div className="px-5 mt-6 text-center">
                {confirm ? (
                    <div className="bg-white rounded-[20px] p-6 shadow-sm text-center">
                        <p className="text-[15px] mb-5 opacity-80">{de.donationDetail.deleteConfirm}</p>
                        <div className="flex gap-3 justify-center">
                            <button onClick={() => setConfirm(false)}
                                className="h-10 min-w-[120px] px-4 rounded-full border-2 font-bold text-[13px] flex items-center justify-center"
                                style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                                {de.donationDetail.cancel}
                            </button>
                            <button onClick={deleteDonation} disabled={deleting}
                                className="h-10 min-w-[120px] px-4 rounded-full text-white font-bold text-[13px] flex items-center justify-center"
                                style={{ backgroundColor: BRAND.error, fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                                {deleting ? de.common.loading : de.donationDetail.deleteConfirmBtn}
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-[13px] opacity-100">
                        {de.donationDetail.cantFind}<br />
                        <button onClick={() => setConfirm(true)}
                            className="font-bold underline"
                            style={{ color: BRAND.green }}>
                            {de.donationDetail.deleteDonation}
                        </button>
                    </p>
                )}
            </div>
        );
    }

    // For waiting / approved — plain delete button
    return (
        <div className="px-5 mt-6">
            {confirm ? (
                <div className="bg-white rounded-[20px] p-6 shadow-sm text-center">
                    <p className="text-[15px] mb-5 opacity-80">{de.donationDetail.deleteConfirm}</p>
                    <div className="flex gap-3 justify-center">
                        <button onClick={() => setConfirm(false)}
                            className="h-10 min-w-[120px] px-4 rounded-full border-2 font-bold text-[13px] flex items-center justify-center"
                            style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                            {de.donationDetail.cancel}
                        </button>
                        <button onClick={deleteDonation} disabled={deleting}
                            className="h-10 min-w-[120px] px-4 rounded-full text-white font-bold text-[13px] flex items-center justify-center"
                            style={{ backgroundColor: BRAND.error, fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                            {deleting ? de.common.loading : de.donationDetail.deleteConfirmBtn}
                        </button>
                    </div>
                </div>
            ) : (
                <button onClick={() => setConfirm(true)}
                    className="w-full text-center text-[13px] font-bold underline opacity-60 py-2"
                    style={{ color: BRAND.error }}>
                    {de.donationDetail.delete}
                </button>
            )}
        </div>
    );
}
