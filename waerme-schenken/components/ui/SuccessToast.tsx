'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { BRAND } from '@/lib/constants';

export function SuccessToast({ message }: { message: string }) {
    const searchParams  = useSearchParams();
    const router        = useRouter();
    const pathname      = usePathname();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (searchParams.get('success') === '1') {
            setVisible(true);
            // Remove ?success=1 from URL without reload
            router.replace(pathname, { scroll: false });
            // Auto-dismiss after 3.5s
            const timer = setTimeout(() => setVisible(false), 3500);
            return () => clearTimeout(timer);
        }
    }, [searchParams, router, pathname]);

    if (!visible) return null;

    return (
        <div
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-full shadow-xl"
            style={{ backgroundColor: BRAND.greenDark, color: '#fff', maxWidth: '90vw' }}
        >
            <CheckCircle2 size={18} className="shrink-0" />
            <span className="text-[14px] font-bold" style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                {message}
            </span>
        </div>
    );
}
