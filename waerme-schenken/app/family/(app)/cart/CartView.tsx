'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Package, ShoppingCart, X, ChevronLeft } from 'lucide-react';
import { BRAND, CONDITION_COLORS } from '@/lib/constants';
import { de } from '@/lib/i18n/de';
import { useFamilyCart } from '@/lib/familyCart';

type FamilyInfo = { firstName: string; lastName: string; street: string; zipCode: string; city: string };

type CartDonation = {
    id: string; toyName: string; ageRange: string; condition: string;
    category: string; status: string;
    images: { imageUrl: string }[];
};

const CONDITION_SHORT: Record<string, string> = {
    neu_originalverpackt:     'neu',
    wie_neu:                  'wie neu',
    leichte_gebrauchsspuren:  'gebraucht',
    starke_gebrauchsspuren:   'gebraucht',
};

export function CartView({ family }: { family: FamilyInfo }) {
    const router = useRouter();
    const cart = useFamilyCart();
    const [items, setItems]   = useState<CartDonation[]>([]);
    const [loading, setLoading] = useState(true);
    const [step, setStep]       = useState<1 | 2>(1);
    const [confirming, setConfirming] = useState(false);
    const [error, setError]     = useState('');

    useEffect(() => {
        if (cart.ids.length === 0) {
            setItems([]); setLoading(false); return;
        }
        setLoading(true);
        fetch('/api/family/cart-details', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: cart.ids }),
        }).then(r => r.ok ? r.json() : { items: [] }).then(data => {
            setItems(data.items || []);
        }).finally(() => setLoading(false));
    }, [cart.ids.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

    async function confirmOrder() {
        setConfirming(true); setError('');
        try {
            const res = await fetch('/api/family/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ donationIds: cart.ids }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || de.common.error);
                if (data.code === 'CONFLICT' || data.code === 'NOT_FOUND') {
                    // Refresh items so user can see what's left
                    setStep(1);
                }
                return;
            }
            cart.clear();
            router.replace('/family/dashboard?ordered=1');
        } finally { setConfirming(false); }
    }

    const addressComplete = family.street && family.zipCode && family.city;

    // Empty state
    if (!loading && items.length === 0) {
        return (
            <>
                <h1 className="mb-8" style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: '22px' }}>
                    {de.family.cart.heading}
                </h1>
                <div className="bg-white rounded-[8px] p-12 flex flex-col items-center gap-5 shadow-sm">
                    <ShoppingCart size={48} className="opacity-20" />
                    <p className="opacity-60">{de.family.cart.empty}</p>
                    <Link href="/family/shop"
                        className="px-8 h-10 rounded-full text-white flex items-center justify-center"
                        style={{ backgroundColor: BRAND.green, fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: '13px', letterSpacing: '0.15em' }}>
                        {de.family.cart.browseShop.toUpperCase()}
                    </Link>
                </div>
            </>
        );
    }

    if (step === 2) {
        return (
            <>
                <div className="flex items-center gap-3 mb-6">
                    <button onClick={() => setStep(1)} className="p-2 bg-white rounded-full shadow-sm">
                        <ChevronLeft size={20} color={BRAND.green} />
                    </button>
                    <h1 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: '22px' }}>
                        {de.family.cart.confirmHeading}
                    </h1>
                </div>

                <p className="opacity-70 text-[14px] mb-6 leading-relaxed">
                    {de.family.cart.confirmHint}
                </p>

                <div className="bg-white rounded-[8px] p-6 shadow-sm mb-6">
                    <p className="text-xs font-bold uppercase tracking-widest opacity-40 mb-3"
                        style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                        Lieferadresse
                    </p>
                    <p className="font-bold text-[16px] leading-relaxed">
                        {family.firstName} {family.lastName}<br />
                        {family.street}<br />
                        {family.zipCode} {family.city}
                    </p>
                    <Link href="/family/profile"
                        className="text-sm font-bold underline mt-4 inline-block"
                        style={{ color: BRAND.green }}>
                        {de.family.cart.editAddress}
                    </Link>
                </div>

                {!addressComplete && (
                    <p className="text-[13px] mb-4" style={{ color: BRAND.error }}>
                        Bitte vervollständige deine Adresse vor dem Bestellen.
                    </p>
                )}

                {error && <p className="text-[13px] mb-4 text-center" style={{ color: BRAND.error }}>{error}</p>}

                <div className="flex flex-col items-center gap-3">
                    <button onClick={confirmOrder} disabled={confirming || !addressComplete}
                        className="w-full max-w-xs h-11 rounded-full text-white shadow-lg active:scale-95 disabled:opacity-50"
                        style={{ backgroundColor: BRAND.green, fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: '13px', letterSpacing: '0.15em' }}>
                        {confirming ? de.common.loading : de.family.cart.confirmOrder.toUpperCase()}
                    </button>
                </div>
            </>
        );
    }

    // Step 1: Cart list
    return (
        <>
            <h1 className="mb-8" style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: '22px' }}>
                {de.family.cart.heading}
            </h1>

            <div className="space-y-3 mb-8">
                {items.map(p => {
                    const cond = CONDITION_SHORT[p.condition] || p.condition;
                    const condColor = CONDITION_COLORS[p.condition] || BRAND.lila;
                    const thumb = p.images[0]?.imageUrl;
                    const stale = p.status !== 'approved';

                    return (
                        <div key={p.id} className="bg-white rounded-[8px] flex items-center overflow-hidden shadow-sm"
                            style={{ opacity: stale ? 0.5 : 1 }}>
                            <div className="w-20 h-20 shrink-0 bg-gray-100 flex items-center justify-center overflow-hidden">
                                {thumb
                                    ? <img src={thumb} alt={p.toyName} className="w-full h-full object-cover" />
                                    : <Package size={28} className="opacity-30" />}
                            </div>
                            <div className="flex-1 p-3">
                                <h3 className="font-bold text-[14px] leading-tight mb-1"
                                    style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                                    {p.toyName}
                                </h3>
                                <p className="text-[12px] opacity-60 mb-1">Age: {p.ageRange}</p>
                                <span className="inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                                    style={{ backgroundColor: condColor, opacity: 0.75 }}>
                                    {cond}
                                </span>
                                {stale && (
                                    <p className="text-[11px] mt-1" style={{ color: BRAND.error }}>
                                        Nicht mehr verfügbar
                                    </p>
                                )}
                            </div>
                            <button onClick={() => cart.remove(p.id)}
                                className="p-4 opacity-50 hover:opacity-100" aria-label="Entfernen">
                                <X size={16} />
                            </button>
                        </div>
                    );
                })}
            </div>

            <div className="flex flex-col items-center gap-3">
                <button onClick={() => setStep(2)}
                    className="w-full max-w-xs h-11 rounded-full text-white shadow-lg active:scale-95"
                    style={{ backgroundColor: BRAND.green, fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: '13px', letterSpacing: '0.15em' }}>
                    {de.family.cart.checkout.toUpperCase()} ({items.length})
                </button>
                <Link href="/family/shop" className="text-sm underline opacity-60">
                    {de.family.cart.shopMore}
                </Link>
            </div>
        </>
    );
}
