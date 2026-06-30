'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Package, ShoppingCart, X, Clock } from 'lucide-react';
import { BRAND, CONDITION_COLORS } from '@/lib/constants';
import { de } from '@/lib/i18n/de';
import { useFamilyCart } from '@/lib/familyCart';

type FamilyInfo = { firstName: string; lastName: string; street: string; zipCode: string; city: string };

type CartDonation = {
    id: string; toyName: string; category: string; condition: string; status: string;
    reservedUntil?: string | null;
    reservedByFamilyId?: string | null;
    images: { imageUrl: string }[];
};

const CONDITION_SHORT: Record<string, string> = {
    neu_originalverpackt:     'neu',
    wie_neu:                  'wie neu',
    leichte_gebrauchsspuren:  'gebraucht',
    starke_gebrauchsspuren:   'gebraucht',
};

function StepBar({ step }: { step: 1 | 2 }) {
    return (
        <div className="flex gap-2 mb-8">
            {[1, 2].map((s) => (
                <div key={s} className="h-1 flex-1 rounded-full transition-all"
                    style={{ backgroundColor: s <= step ? BRAND.greenDark : '#fff' }} />
            ))}
        </div>
    );
}

export function CartView({ family }: { family: FamilyInfo }) {
    const router = useRouter();
    const cart = useFamilyCart();
    const [items, setItems]         = useState<CartDonation[]>([]);
    const [loading, setLoading]     = useState(true);
    const [step, setStep]           = useState<1 | 2>(1);
    const [confirming, setConfirming] = useState(false);
    const [error, setError]         = useState('');
    const [userId, setUserId]       = useState<string | null>(null);
    const [timeLeft, setTimeLeft]   = useState<number | null>(null);

    useEffect(() => {
        if (!userId || items.length === 0) return;
        const reservedItems = items.filter(i => 
            i.reservedByFamilyId === userId && 
            i.reservedUntil && 
            new Date(i.reservedUntil).getTime() > Date.now()
        );
        if (reservedItems.length === 0) {
            setTimeLeft(null);
            return;
        }
        const minTime = Math.min(...reservedItems.map(i => new Date(i.reservedUntil!).getTime()));
        const update = () => {
            const left = minTime - Date.now();
            if (left <= 0) setTimeLeft(null);
            else setTimeLeft(left);
        };
        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [items, userId]);

    const formatTime = (ms: number) => {
        const totalSecs = Math.floor(ms / 1000);
        const mins = Math.floor(totalSecs / 60);
        const secs = totalSecs % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

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
            setUserId(data.userId || null);
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
                    setStep(1);
                }
                return;
            }
            cart.clear();
            router.replace('/family/dashboard?ordered=1');
        } finally { setConfirming(false); }
    }

    const addressComplete = family.street && family.zipCode && family.city;

    // Empty state — no step bar needed
    if (!loading && items.length === 0) {
        return (
            <div className="flex flex-col flex-grow">
                <div className="pt-12 px-8 max-w-md w-full mx-auto">
                    <h1 className="mb-8" style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: '27px', lineHeight: '30px' }}>
                        {de.family.cart.heading}
                    </h1>
                </div>
                <div className="bg-white max-w-md w-[calc(100%-40px)] mx-auto flex-grow rounded-t-[8px] shadow-sm flex flex-col">
                    <div className="px-8 pt-8 pb-28 md:pb-8 flex flex-col flex-grow items-center justify-center gap-5 text-center">
                        <ShoppingCart size={48} className="opacity-20" />
                        <p className="opacity-60">{de.family.cart.empty}</p>
                        <Link href="/family/shop"
                            className="h-10 min-w-[143px] px-6 rounded-full text-white flex items-center justify-center"
                            style={{ backgroundColor: BRAND.green, fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: '13px', letterSpacing: '0.15em' }}>
                            {de.family.cart.browseShop.toUpperCase()}
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Step 2: Address confirm
    if (step === 2) {
        return (
            <div className="flex flex-col flex-grow">
                {/* Beige top: step bar + title */}
                <div className="pt-12 px-8 max-w-md w-full mx-auto">
                    <StepBar step={2} />
                    <h1 className="mb-8" style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: '27px', lineHeight: '30px' }}>
                        {de.family.cart.confirmHeading}
                    </h1>
                </div>

                {/* White card fills rest of screen */}
                <div className="bg-white max-w-md w-[calc(100%-40px)] mx-auto flex-grow rounded-t-[8px] shadow-sm flex flex-col">
                    <div className="px-8 pt-8 pb-28 md:pb-8 flex flex-col flex-grow">
                        <div className="flex-grow">
                            <p className="opacity-70 text-[14px] mb-6 leading-relaxed">
                                {de.family.cart.confirmHint}
                            </p>

                            <div className="border-b-2 pb-6 mb-6" style={{ borderColor: '#E5E7EB' }}>
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
                        </div>

                        {/* Pinned bottom buttons */}
                        <div className="mt-auto pt-6 flex flex-col items-center gap-4">
                            <button onClick={confirmOrder} disabled={confirming || !addressComplete}
                                className="h-10 min-w-[143px] px-6 rounded-full text-white shadow-xl transition-transform active:scale-95 disabled:opacity-60 flex items-center justify-center"
                                style={{ backgroundColor: BRAND.green, fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: '14px', letterSpacing: '0.1em' }}>
                                {confirming ? de.common.loading : de.family.cart.confirmOrder.toUpperCase()}
                            </button>
                            <button onClick={() => setStep(1)}
                                className="inline-flex items-center gap-2">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path d="M12 5L7 10L12 15" stroke={BRAND.green} strokeWidth="2.5" strokeLinecap="round"/>
                                </svg>
                                <span className="font-bold uppercase tracking-widest text-sm"
                                    style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                                    {de.common.back}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Step 1: Cart list
    return (
        <div className="flex flex-col flex-grow">
            {/* Beige top: step bar + title */}
            <div className="pt-12 px-8 max-w-md w-full mx-auto">
                <StepBar step={1} />
                <h1 className="mb-8" style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: '27px', lineHeight: '30px' }}>
                    {de.family.cart.heading}
                </h1>
            </div>

            {/* White card fills rest of screen */}
            <div className="bg-white max-w-md w-[calc(100%-40px)] mx-auto flex-grow rounded-t-[8px] shadow-sm flex flex-col">
                <div className="px-8 pt-8 pb-28 md:pb-8 flex flex-col flex-grow">
                    <div className="flex-grow space-y-3">
                        {timeLeft !== null && (
                            <div className="bg-yellow-50 text-yellow-800 text-[13px] leading-relaxed p-4 rounded-[8px] mb-4 border border-yellow-200">
                                <div className="flex items-center gap-2 mb-1 font-bold">
                                    <Clock size={16} />
                                    <span>Reserviert ({formatTime(timeLeft)})</span>
                                </div>
                                Die Spielsachen in deinem Warenkorb sind für 30 Minuten reserviert. Wenn du die Bestellung nicht innerhalb dieses Zeitfensters abschliesst, landen die Spielsachen wieder zurück in der Börse.
                            </div>
                        )}
                        {items.map(p => {
                            const cond = CONDITION_SHORT[p.condition] || p.condition;
                            const condColor = CONDITION_COLORS[p.condition] || BRAND.lila;
                            const thumb = p.images[0]?.imageUrl;
                            
                            // It's stale if not approved, OR if it's reserved by someone else and not expired
                            const isReservedByOther = p.reservedByFamilyId && p.reservedByFamilyId !== userId && p.reservedUntil && new Date(p.reservedUntil).getTime() > Date.now();
                            const stale = p.status !== 'approved' || isReservedByOther;

                            return (
                                <div key={p.id} className="bg-gray-50 rounded-[8px] flex items-center overflow-hidden"
                                    style={{ opacity: stale ? 0.5 : 1 }}>
                                    <div className="w-20 h-20 shrink-0 bg-gray-100 flex items-center justify-center overflow-hidden rounded-l-[8px]">
                                        {thumb
                                            ? <img src={thumb} alt={p.toyName} className="w-full h-full object-cover" />
                                            : <Package size={28} className="opacity-30" />}
                                    </div>
                                    <div className="flex-1 p-3">
                                        <h3 className="font-bold text-[14px] leading-tight mb-1"
                                            style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                                            {p.toyName}
                                        </h3>
                                        <p className="text-[12px] opacity-60 mb-1">{p.ageRange}</p>
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

                    {/* Pinned bottom buttons */}
                    <div className="mt-auto pt-6 flex flex-col items-center gap-4">
                        <button onClick={() => setStep(2)}
                            className="h-10 min-w-[143px] px-6 rounded-full text-white shadow-xl transition-transform active:scale-95 flex items-center justify-center"
                            style={{ backgroundColor: BRAND.green, fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: '14px', letterSpacing: '0.1em' }}>
                            {de.family.cart.checkout.toUpperCase()} ({items.length})
                        </button>
                        <Link href="/family/shop" className="text-sm font-bold underline opacity-60"
                            style={{ color: BRAND.green }}>
                            {de.family.cart.shopMore}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
