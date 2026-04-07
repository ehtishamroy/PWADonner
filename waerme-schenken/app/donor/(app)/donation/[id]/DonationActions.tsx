'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { de } from '@/lib/i18n/de';
import { BRAND } from '@/lib/constants';

interface Props {
    donationId: string;
    status: string;
}

export function DonationActions({ donationId, status }: Props) {
    const router = useRouter();
    const [tracking, setTracking] = useState('');
    const [sending,  setSending]  = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [confirm,  setConfirm]  = useState(false);

    async function markSent() {
        setSending(true);
        await fetch(`/api/donations/${donationId}`, {
            method:  'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ status: 'sent', trackingNumber: tracking }),
        });
        setSending(false);
        router.refresh();
    }

    async function deleteDonation() {
        setDeleting(true);
        await fetch(`/api/donations/${donationId}`, { method: 'DELETE' });
        router.replace('/donor/dashboard');
    }

    if (status !== 'selected') {
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

    return (
        <div className="px-5 mt-6 space-y-3">
            {/* Tracking input */}
            <div className="bg-white rounded-[20px] p-5 shadow-sm">
                <label className="text-xs font-bold uppercase tracking-widest opacity-40 block mb-2"
                    style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                    {de.donationDetail.trackingNumber}
                </label>
                <input
                    type="text"
                    value={tracking}
                    onChange={e => setTracking(e.target.value)}
                    className="w-full bg-transparent border-b-2 border-gray-200 pb-2 outline-none font-medium text-[15px]"
                    placeholder="z.B. 990000000000000000"
                />
            </div>
            {/* Send button */}
            <button
                onClick={markSent}
                disabled={sending}
                className="mx-auto h-10 min-w-[143px] px-6 rounded-full text-white font-bold uppercase tracking-widest transition-transform active:scale-95 disabled:opacity-50 flex items-center justify-center"
                style={{ backgroundColor: BRAND.green, fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: '13px', letterSpacing: '0.1em' }}
            >
                {sending ? de.common.loading : de.donationDetail.markSent.toUpperCase()}
            </button>
        </div>
    );
}
