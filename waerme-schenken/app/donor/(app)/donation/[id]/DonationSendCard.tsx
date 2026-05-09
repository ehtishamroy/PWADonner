'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { de } from '@/lib/i18n/de';
import { BRAND } from '@/lib/constants';

type FamilyInfo = {
    firstName: string;
    lastName: string;
    street: string | null;
    zipCode: string | null;
    city: string | null;
};

interface Props {
    donationId: string;
    family: FamilyInfo | null;
}

export function DonationSendCard({ donationId, family }: Props) {
    const router = useRouter();
    const [tracking, setTracking] = useState('');
    const [sending, setSending]   = useState(false);

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

    return (
        <div className="px-5 mb-4">
            <div className="bg-white rounded-[24px] p-7 shadow-sm relative z-10 mb-[-40px]">
                {/* Address */}
                <p className="text-xs font-bold uppercase tracking-widest opacity-40 mb-2"
                    style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                    {de.donationDetail.address}
                </p>
                {family ? (
                    <p className="font-bold text-[16px] leading-relaxed mb-4">
                        {family.firstName} {family.lastName}<br />
                        {family.street}<br />
                        {family.zipCode} {family.city}
                    </p>
                ) : (
                    <p className="font-bold text-[16px] leading-snug mb-4 opacity-60">
                        Familie wartet auf Bestätigung
                    </p>
                )}

                {/* Tracking input — directly below address */}
                <div className="border-b-2 border-gray-200 pb-2 mb-4">
                    <label className="text-xs font-bold uppercase tracking-widest opacity-40 block mb-1"
                        style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                        {de.donationDetail.trackingNumber}
                    </label>
                    <input
                        type="text"
                        value={tracking}
                        onChange={e => setTracking(e.target.value)}
                        className="w-full bg-transparent outline-none font-medium text-[15px] placeholder:opacity-30"
                        placeholder="z.B. 99.12.123456.12345678"
                    />
                </div>

                {/* Send hint */}
                <p className="text-[14px] opacity-70 mb-5">{de.donationDetail.sendTo}</p>

                {/* SEND button */}
                <div className="flex justify-center">
                    <button
                        onClick={markSent}
                        disabled={sending}
                        className="h-10 min-w-[143px] px-6 rounded-full text-white font-bold uppercase tracking-widest transition-transform active:scale-95 disabled:opacity-50 flex items-center justify-center"
                        style={{ backgroundColor: BRAND.green, fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: '13px', letterSpacing: '0.1em' }}
                    >
                        {sending ? de.common.loading : de.donationDetail.markSent.toUpperCase()}
                    </button>
                </div>
            </div>
        </div>
    );
}
