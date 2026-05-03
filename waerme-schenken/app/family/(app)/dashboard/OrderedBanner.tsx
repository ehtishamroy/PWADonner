'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { BRAND } from '@/lib/constants';

export function OrderedBanner() {
    const params = useSearchParams();
    const router = useRouter();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (params.get('ordered') === '1') {
            setVisible(true);
            const t = setTimeout(() => {
                setVisible(false);
                router.replace('/family/dashboard');
            }, 4000);
            return () => clearTimeout(t);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    if (!visible) return null;

    return (
        <div
            onClick={() => { setVisible(false); router.replace('/family/dashboard'); }}
            className="flex items-center gap-3 rounded-[8px] px-5 py-4 mb-6 shadow-sm cursor-pointer active:scale-[0.99] transition-transform"
            style={{ backgroundColor: BRAND.green }}>
            <CheckCircle2 size={22} className="shrink-0 text-white" />
            <p className="text-white font-bold text-[14px] leading-snug"
                style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                Bestellung erfolgreich! Du erhältst in Kürze eine Bestätigungs-E-Mail.
            </p>
        </div>
    );
}
