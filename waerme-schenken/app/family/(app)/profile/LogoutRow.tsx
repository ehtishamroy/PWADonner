'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, ChevronRight } from 'lucide-react';
import { BRAND } from '@/lib/constants';

export function LogoutRow() {
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="w-full flex justify-between items-center px-7 py-5 hover:bg-gray-50 transition-colors group text-left">
                <span className="font-bold text-[15px] uppercase tracking-widest flex items-center gap-3"
                    style={{ fontFamily: "'Bricolage Grotesque',sans-serif", color: BRAND.green, opacity: 0.85 }}>
                    <LogOut size={16} strokeWidth={2} />
                    Abmelden
                </span>
                <ChevronRight size={20} className="opacity-25 group-hover:opacity-60 transition-opacity" />
            </button>

            {showModal && (
                <div className="fixed inset-0 bg-black/30 z-[60] flex items-center justify-center px-6"
                    onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-[16px] p-7 w-full max-w-xs shadow-xl"
                        onClick={e => e.stopPropagation()}>
                        <p className="text-[18px] font-bold mb-2"
                            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>Abmelden?</p>
                        <p className="text-[14px] opacity-60 mb-6"
                            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>Du bist dabei, dich abzumelden.</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 h-10 rounded-full border-2 font-bold text-[13px] uppercase tracking-widest"
                                style={{ borderColor: BRAND.green, color: BRAND.green, fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                                Abbrechen
                            </button>
                            <button
                                onClick={() => router.push('/family/logout')}
                                className="flex-1 h-10 rounded-full font-bold text-[13px] uppercase tracking-widest text-white"
                                style={{ backgroundColor: BRAND.green, fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                                Abmelden
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
