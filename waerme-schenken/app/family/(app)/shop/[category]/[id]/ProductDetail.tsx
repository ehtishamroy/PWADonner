'use client';

import Link from 'next/link';
import { useState, useRef } from 'react';
import { ChevronLeft, ShoppingCart, Package } from 'lucide-react';
import Image from 'next/image';
import { BRAND, CONDITION_LABELS } from '@/lib/constants';
import { de } from '@/lib/i18n/de';
import { useFamilyCart } from '@/lib/familyCart';

type Props = {
    id: string;
    category: string;
    toyName: string;
    ageRange: string;
    condition: string;
    description: string;
    condColor: string;
    images: string[];
};

export function ProductDetail({ id, category, toyName, ageRange, condition, description, condColor, images }: Props) {
    const [idx, setIdx] = useState(0);
    const [limitToast, setLimitToast] = useState(false);
    const touchStartX = useRef<number | null>(null);
    const cart = useFamilyCart();

    function onTouchStart(e: React.TouchEvent) {
        touchStartX.current = e.touches[0].clientX;
    }
    function onTouchEnd(e: React.TouchEvent) {
        if (touchStartX.current == null || images.length < 2) return;
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        touchStartX.current = null;
        if (Math.abs(dx) < 40) return;
        if (dx < 0) setIdx(i => Math.min(i + 1, images.length - 1));
        else        setIdx(i => Math.max(i - 1, 0));
    }
    const added = cart.has(id);
    const current = images[idx];
    const condShort = condition === 'neu_originalverpackt' ? 'neu'
                    : condition === 'wie_neu' ? 'wie neu'
                    : 'gebraucht';

    function toggle() {
        if (added) { cart.remove(id); return; }
        const r = cart.add(id);
        if (!r.ok && r.reason === 'limit') {
            setLimitToast(true);
            setTimeout(() => setLimitToast(false), 3000);
            return;
        }
        if (r.ok) {
            window.dispatchEvent(new CustomEvent('cart:added'));
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            {/* Top bar */}
            <div className="pt-8 px-5 flex items-center gap-3 mb-6">
                <Link href={`/family/shop/${encodeURIComponent(category)}`}
                    className="flex items-center gap-3">
                    <ChevronLeft size={22} color={BRAND.green} />
                    <span className="font-bold uppercase tracking-widest text-sm"
                        style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                        {de.common.back.toUpperCase()}
                    </span>
                </Link>
            </div>

            {/* Image + dots */}
            <div className="px-5">
                <div
                    onTouchStart={onTouchStart}
                    onTouchEnd={onTouchEnd}
                    className="relative rounded-[8px] overflow-hidden aspect-square bg-white shadow-md flex items-center justify-center touch-pan-y select-none"
                >
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-[12px] font-medium z-10"
                        style={{ backgroundColor: condColor, opacity: 0.75 }}>
                        {condShort}
                    </div>
                    {current ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={current} alt={toyName} className="w-full h-full object-cover" />
                    ) : (
                        <Package size={120} className="opacity-30" />
                    )}
                </div>
                {images.length > 1 && (
                    <div className="flex justify-center gap-2 mt-4">
                        {images.map((_, i) => (
                            <button key={i} onClick={() => setIdx(i)}
                                className="rounded-full transition-all"
                                style={{
                                    width:  i === idx ? 10 : 8,
                                    height: i === idx ? 10 : 8,
                                    backgroundColor: i === idx ? '#000' : 'rgba(0,0,0,0.25)',
                                }} />
                        ))}
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="px-5 pt-6">
                <h1 className="mb-2" style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: '20px' }}>
                    {toyName}
                </h1>
                <p className="text-[14px] mb-4">Age: {ageRange}</p>
                <p className="text-[14px] opacity-80 leading-relaxed mb-6">{description}</p>
                <p className="text-[13px] opacity-60 mb-8">
                    Zustand: {CONDITION_LABELS[condition] || condition}
                </p>
            </div>

            {/* CTA */}
            <div className="px-5">
                <button onClick={toggle}
                    className="w-full h-12 rounded-full text-white flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all"
                    style={{
                        backgroundColor: BRAND.green,
                        fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: '13px', letterSpacing: '0.15em',
                    }}>
                    {added ? (
                        <><Image src="/images/cart.png" alt="" width={20} height={20} className="brightness-0 invert" /> {de.family.shop.added.toUpperCase()}</>
                    ) : (
                        <><ShoppingCart size={18} fill="white" /> {de.family.shop.addToCart.toUpperCase()}</>
                    )}
                </button>
            </div>

            {limitToast && (
                <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 bg-black/90 text-white px-5 py-3 rounded-full text-sm z-50 shadow-lg">
                    {de.family.shop.limitReached}
                </div>
            )}
        </div>
    );
}
