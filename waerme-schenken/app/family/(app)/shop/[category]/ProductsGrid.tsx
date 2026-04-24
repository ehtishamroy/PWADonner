'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    ChevronLeft, Search, ChevronDown, Package, ArrowUp,
} from 'lucide-react';
import Image from 'next/image';
import { BRAND, CONDITION_COLORS, AGE_RANGES } from '@/lib/constants';
import { de } from '@/lib/i18n/de';
import { useFamilyCart, CART_MAX } from '@/lib/familyCart';

type Product = {
    id: string; toyName: string; ageRange: string; condition: string;
    category: string;
    images: { imageUrl: string }[];
};

const PAGE_SIZE = 24;

const CONDITION_SHORT: Record<string, string> = {
    neu_originalverpackt:     'neu',
    wie_neu:                  'wie neu',
    leichte_gebrauchsspuren:  'gebraucht',
    starke_gebrauchsspuren:   'gebraucht',
};

export function ProductsGrid({ category }: { category: string }) {
    const [items, setItems]       = useState<Product[]>([]);
    const [total, setTotal]       = useState(0);
    const [loading, setLoading]   = useState(true);
    const [searchOpen, setSearch] = useState(false);
    const [query, setQuery]       = useState('');
    const searchParams = useSearchParams();
    const initialAge = searchParams?.get('age') ?? '';
    const [ageOpen, setAgeOpen]   = useState(false);
    const [ageFilter, setAgeFilter] = useState<string>(initialAge);
    const [limitToast, setLimitToast] = useState(false);
    const [showTop, setShowTop] = useState(false);
    const cart = useFamilyCart();

    useEffect(() => {
        const onScroll = () => setShowTop(window.scrollY > 400);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        let ignore = false;
        setLoading(true);
        const url = new URL('/api/family/shop', window.location.origin);
        url.searchParams.set('category', category);
        if (ageFilter) url.searchParams.set('ageRange', ageFilter);
        url.searchParams.set('limit', String(PAGE_SIZE));
        url.searchParams.set('skip', '0');
        fetch(url).then(r => r.json()).then(data => {
            if (ignore) return;
            setItems(data.items || []);
            setTotal(data.total || 0);
        }).finally(() => { if (!ignore) setLoading(false); });
        return () => { ignore = true; };
    }, [category, ageFilter]);

    async function loadMore() {
        const url = new URL('/api/family/shop', window.location.origin);
        url.searchParams.set('category', category);
        if (ageFilter) url.searchParams.set('ageRange', ageFilter);
        url.searchParams.set('limit', String(PAGE_SIZE));
        url.searchParams.set('skip', String(items.length));
        const res = await fetch(url);
        const data = await res.json();
        setItems(prev => [...prev, ...(data.items || [])]);
    }

    const visible = items.filter(p =>
        !query || p.toyName.toLowerCase().includes(query.toLowerCase())
    );

    function handleAdd(id: string) {
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
        <>
            {/* Top bar */}
            <div className="flex items-center gap-3 mb-6 md:mb-10">
                <Link href="/family/shop"
                    className="p-2 bg-white rounded-full shadow-sm hover:scale-110 transition-transform shrink-0">
                    <ChevronLeft size={20} color={BRAND.green} />
                </Link>

                {searchOpen ? (
                    <div className="bg-white h-10 flex-1 rounded-full shadow-sm flex items-center px-5 gap-3">
                        <input autoFocus value={query} onChange={e => setQuery(e.target.value)}
                            placeholder={de.family.shop.searchPlaceholder}
                            className="bg-transparent w-full text-[14px] outline-none" />
                        <button onClick={() => { setSearch(false); setQuery(''); }}>
                            <Search size={18} color={BRAND.green} />
                        </button>
                    </div>
                ) : (
                    <>
                        <h1 className="flex-1 font-bold text-[20px] uppercase tracking-widest truncate"
                            style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                            {category}
                        </h1>
                        <button onClick={() => setSearch(true)}
                            className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center shrink-0">
                            <Search size={18} color={BRAND.green} />
                        </button>
                    </>
                )}

                <div className="relative shrink-0">
                    <button onClick={() => setAgeOpen(o => !o)}
                        className="bg-white h-10 px-4 rounded-full shadow-sm flex items-center gap-2">
                        <span className="text-[13px] font-bold" style={{ fontFamily: "'Bricolage Grotesque',sans-serif", color: BRAND.green }}>
                            {ageFilter || de.family.shop.ageFilter}
                        </span>
                        <ChevronDown size={16} color={BRAND.green} className={`transition-transform ${ageOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {ageOpen && (
                        <div className="absolute top-full right-0 mt-2 bg-white rounded-[12px] shadow-xl overflow-hidden z-50 min-w-[160px]">
                            <button onClick={() => { setAgeFilter(''); setAgeOpen(false); }}
                                className="w-full text-left px-5 py-3 text-sm hover:bg-gray-50 border-b border-gray-50">
                                Alle
                            </button>
                            {AGE_RANGES.map((a, i) => (
                                <button key={a}
                                    onClick={() => { setAgeFilter(a); setAgeOpen(false); }}
                                    className={`w-full text-left px-5 py-3 text-sm hover:bg-gray-50 ${i < AGE_RANGES.length - 1 ? 'border-b border-gray-50' : ''}`}
                                    style={{
                                        color: a === ageFilter ? BRAND.green : '#000',
                                        fontWeight: a === ageFilter ? 700 : 500,
                                        backgroundColor: a === ageFilter ? 'rgba(83,125,97,0.08)' : '#fff',
                                    }}>
                                    {a}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <p className="opacity-50 text-center py-20">Laden...</p>
            ) : visible.length === 0 ? (
                <p className="opacity-50 text-center py-20">Keine Spielzeuge verfügbar.</p>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
                    {visible.map(p => {
                        const added = cart.has(p.id);
                        const cond = CONDITION_SHORT[p.condition] || p.condition;
                        const condColor = CONDITION_COLORS[p.condition] || BRAND.lila;
                        const thumb = p.images[0]?.imageUrl;

                        return (
                            <div key={p.id} className="bg-white rounded-[8px] p-2 pb-3 shadow-sm relative flex flex-col">
                                <Link href={`/family/shop/${encodeURIComponent(category)}/${p.id}`}
                                    className="relative w-full aspect-square rounded-[6px] overflow-hidden mb-2 bg-gray-100">
                                    <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full text-[10px] font-medium z-10"
                                        style={{ backgroundColor: condColor, opacity: 0.75, color: '#000' }}>
                                        {cond}
                                    </div>
                                    {thumb ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={thumb} alt={p.toyName} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center opacity-30">
                                            <Package size={40} />
                                        </div>
                                    )}
                                </Link>
                                <div className="px-1 flex-grow">
                                    <h3 className="font-bold text-[13px] leading-[1.2] mb-0.5 line-clamp-2"
                                        style={{ fontFamily: "'Bricolage Grotesque',sans-serif", minHeight: '32px' }}>
                                        {p.toyName}
                                    </h3>
                                    <p className="text-[11px] opacity-60">{p.ageRange}</p>
                                </div>
                                <button onClick={() => added ? cart.remove(p.id) : handleAdd(p.id)}
                                    className="absolute bottom-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-white/70"
                                    aria-label={added ? 'Entfernen' : 'Hinzufügen'}>
                                    {added
                                        ? <Image src="/images/cart.png" alt="" width={18} height={18} style={{ filter: 'brightness(0) saturate(100%) invert(40%) sepia(50%) saturate(400%) hue-rotate(100deg)' }} />
                                        : <Image src="/images/shopcart.png" alt="" width={20} height={20} />}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Load more */}
            {items.length < total && !loading && (
                <div className="text-center mt-8">
                    <button onClick={loadMore}
                        className="px-6 h-10 rounded-full bg-white shadow-sm text-sm font-bold"
                        style={{ fontFamily: "'Bricolage Grotesque',sans-serif", color: BRAND.green }}>
                        {de.family.shop.loadMore.toUpperCase()}
                    </button>
                </div>
            )}

            {/* Limit toast */}
            {limitToast && (
                <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 bg-black/90 text-white px-5 py-3 rounded-full text-sm z-50 shadow-lg">
                    {de.family.shop.limitReached} ({CART_MAX}/{CART_MAX})
                </div>
            )}

            {/* Back to top */}
            {showTop && (
                <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    aria-label={de.family.shop.backToTop}
                    className="fixed bottom-24 md:bottom-8 right-5 w-11 h-11 rounded-full shadow-lg flex items-center justify-center z-40 active:scale-95 transition-transform"
                    style={{ backgroundColor: BRAND.green, color: '#fff' }}
                >
                    <ArrowUp size={20} strokeWidth={2.5} />
                </button>
            )}
        </>
    );
}
