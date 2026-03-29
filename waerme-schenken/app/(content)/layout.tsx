'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { BRAND } from '@/lib/constants';

export default function ContentLayout({ children }: { children: ReactNode }) {
    const router = useRouter();

    return (
        <div className="min-h-screen pt-12 px-5 pb-24" style={{ backgroundColor: BRAND.beige }}>
            <div className="max-w-2xl mx-auto">
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 mb-8 opacity-60 hover:opacity-100 transition-opacity"
                >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M12 5L7 10L12 15" stroke={BRAND.green} strokeWidth="2.5" strokeLinecap="round"/>
                    </svg>
                    <span className="font-bold uppercase tracking-widest text-sm" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                        Zurück
                    </span>
                </button>
                <div className="bg-white rounded-[28px] p-7 md:p-10 shadow-sm leading-relaxed whitespace-pre-line text-[15px]">
                    {children}
                </div>
            </div>
        </div>
    );
}
