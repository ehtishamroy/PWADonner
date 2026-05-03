'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Search, ChevronRight, ChevronDown, Package, X } from 'lucide-react';
import { BRAND, AGE_RANGES, CONDITION_COLORS } from '@/lib/constants';
import { de } from '@/lib/i18n/de';
import { useFamilyCart, CART_MAX } from '@/lib/familyCart';

type Category = {
    id: string; name: string; bg: string; count: number;
    imageUrl: string | null;
};
type SearchResult = {
    id: string; toyName: string; ageRange: string; condition: string;
    category: string;
    images: { imageUrl: string }[];
};

const CONDITION_SHORT: Record<string, string> = {
    neu_originalverpackt: 'neu',
    wie_neu: 'wie neu',
    leichte_gebrauchsspuren: 'gebraucht',
    starke_gebrauchsspuren: 'gebraucht',
};

export function CategoryList({ categories, isSpecial = false }: { categories: Category[]; isSpecial?: boolean }) {
    const [search, setSearch] = useState('');
    const [ageOpen, setAgeOpen] = useState(false);
    const [ageFilter, setAgeFilter] = useState<string>('');
    const [counts, setCounts] = useState<Record<string, number>>(
        Object.fromEntries(categories.map(c => [c.id, c.count]))
    );
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [limitModal, setLimitModal] = useState(false);
    const cart = useFamilyCart();
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Re-fetch counts whenever the age filter changes
    useEffect(() => {
        let ignore = false;
        const url = new URL('/api/family/shop/categories', window.location.origin);
        if (ageFilter) url.searchParams.set('age', ageFilter);
        fetch(url).then(r => r.json()).then(data => {
            if (ignore) return;
            const map: Record<string, number> = {};
            for (const row of data.counts || []) map[row.category] = row._count;
            setCounts(map);
        }).catch(() => { /* keep previous counts */ });
        return () => { ignore = true; };
    }, [ageFilter]);

    // Cross-category search with debounce
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (!search.trim()) { setSearchResults([]); return; }
        debounceRef.current = setTimeout(() => {
            let ignore = false;
            setSearchLoading(true);
            const url = new URL('/api/family/shop', window.location.origin);
            url.searchParams.set('query', search.trim());
            url.searchParams.set('limit', '48');
            fetch(url)
                .then(r => r.json())
                .then(data => { if (!ignore) setSearchResults(data.items || []); })
                .catch(() => {})
                .finally(() => { if (!ignore) setSearchLoading(false); });
            return () => { ignore = true; };
        }, 300);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [search]);

    function handleAdd(id: string) {
        if (!isSpecial && cart.count >= CART_MAX) { setLimitModal(true); return; }
        const r = cart.add(id);
        if (!r.ok && r.reason === 'limit') { setLimitModal(true); }
    }

    const isSearching = search.trim().length > 0;

    const filtered = categories.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
            {/* Search + Age filter */}
            <div className="flex gap-3 mb-8">
                <div className="bg-white rounded-full flex-1 h-11 px-5 flex items-center gap-3 shadow-sm border border-black/5">
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder={de.family.shop.searchPlaceholder}
                        className="bg-transparent w-full text-[15px] outline-none font-medium" />
                    {isSearching
                        ? <button onClick={() => setSearch('')}><X size={18} color={BRAND.green} /></button>
                        : <Search size={18} color={BRAND.green} />}
                </div>
                {!isSearching && (
                    <div className="relative shrink-0">
                        <button onClick={() => setAgeOpen(o => !o)}
                            className="bg-white rounded-full h-11 px-5 shadow-sm border border-black/5 flex items-center gap-2">
                            <span className="text-[15px] font-medium" style={{ fontFamily: "'Bricolage Grotesque',sans-serif", color: BRAND.green }}>
                                {ageFilter || de.family.shop.ageFilter}
                            </span>
                            <ChevronDown size={16} color={BRAND.green}
                                className={`transition-transform ${ageOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {ageOpen && (
                            <div className="absolute top-full right-0 mt-2 bg-white rounded-[12px] shadow-xl overflow-hidden z-50 min-w-[180px]">
                                <button onClick={() => { setAgeFilter(''); setAgeOpen(false); }}
                                    className="w-full text-left px-5 py-3 text-sm hover:bg-gray-50 border-b border-gray-50"
                                    style={{
                                        color: !ageFilter ? BRAND.green : '#000',
                                        fontWeight: !ageFilter ? 700 : 500,
                                        backgroundColor: !ageFilter ? 'rgba(83,125,97,0.08)' : '#fff',
                                    }}>
                                    Alle Alter
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
                )}
            </div>

            {/* Cross-category search results */}
            {isSearching ? (
                <>
                    <p className="text-[13px] opacity-50 mb-5 font-medium">
                        {searchLoading ? 'Suche...' : `${searchResults.length} Ergebnis${searchResults.length !== 1 ? 'se' : ''}`}
                    </p>
                    {!searchLoading && searchResults.length === 0 && (
                        <p className="text-center opacity-50 py-16">Keine Spielzeuge gefunden.</p>
                    )}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {searchResults.map(p => {
                            const added = cart.has(p.id);
                            const cond = CONDITION_SHORT[p.condition] || p.condition;
                            const condColor = CONDITION_COLORS[p.condition] || BRAND.lila;
                            const thumb = p.images[0]?.imageUrl;
                            return (
                                <div key={p.id} className="bg-white rounded-[8px] p-2 pb-3 shadow-sm relative flex flex-col">
                                    <Link href={`/family/shop/${encodeURIComponent(p.category)}/${p.id}`}
                                        className="relative w-full aspect-square rounded-[6px] overflow-hidden mb-2 bg-gray-100 block">
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
                                    <Link href={`/family/shop/${encodeURIComponent(p.category)}/${p.id}`}
                                        className="px-1 flex-grow block">
                                        <h3 className="font-bold text-[13px] leading-[1.2] mb-0.5 line-clamp-2"
                                            style={{ fontFamily: "'Bricolage Grotesque',sans-serif", minHeight: '32px' }}>
                                            {p.toyName}
                                        </h3>
                                        <p className="text-[11px] opacity-60">{p.ageRange}</p>
                                    </Link>
                                    <button
                                        onClick={() => added ? cart.remove(p.id) : handleAdd(p.id)}
                                        className="absolute bottom-2 right-2 w-8 h-8 flex items-center justify-center rounded-full shadow-sm transition-colors"
                                        style={{ backgroundColor: added ? BRAND.greenBright : '#F3F4F6' }}
                                        aria-label={added ? 'Entfernen' : 'In Warenkorb'}>
                                        <span className="text-[16px] leading-none">{added ? '✓' : '+'}</span>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </>
            ) : (
                <>
                    {/* Heading */}
                    <h1 className="mb-3"
                        style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: '28px', lineHeight: '32px' }}>
                        {de.family.shop.categoriesTitle}
                    </h1>
                    <p className="opacity-80 mb-10 text-[15px] leading-relaxed">
                        {de.family.shop.categoriesSubtitle}
                    </p>

                    {/* Category list */}
                    <div className="flex flex-col gap-2">
                        {filtered.map(cat => {
                            const count = counts[cat.id] ?? 0;
                            const href = ageFilter
                                ? `/family/shop/${encodeURIComponent(cat.id)}?age=${encodeURIComponent(ageFilter)}`
                                : `/family/shop/${encodeURIComponent(cat.id)}`;
                            return (
                                <Link key={cat.id} href={href}
                                    className="bg-white rounded-[8px] h-20 flex items-center overflow-hidden hover:scale-[1.01] transition-transform shadow-sm">
                                    <div className="w-20 h-20 shrink-0 flex items-center justify-center overflow-hidden"
                                        style={{ backgroundColor: cat.bg }}>
                                        {cat.imageUrl ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={cat.imageUrl} alt={cat.name}
                                                className="w-full h-full object-cover" />
                                        ) : (
                                            <Package size={32} className="opacity-30" />
                                        )}
                                    </div>
                                    <span className="flex-1 font-bold text-[16px] pl-6"
                                        style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                                        {cat.name}
                                    </span>
                                    {(count > 0 || ageFilter) && (
                                        <span className="text-[11px] opacity-50 mr-3 font-medium">{count}</span>
                                    )}
                                    <div className="pr-6">
                                        <ChevronRight size={20} className="opacity-50" />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </>
            )}

            {/* Cart limit modal */}
            {limitModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-6"
                    style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
                    onClick={() => setLimitModal(false)}>
                    <div className="bg-white rounded-[16px] p-8 max-w-sm w-full shadow-2xl text-center"
                        onClick={e => e.stopPropagation()}>
                        <p className="text-[20px] font-bold mb-3"
                            style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                            Warenkorb voll
                        </p>
                        <p className="text-[14px] opacity-70 mb-6 leading-relaxed">
                            Du hast bereits {CART_MAX} Spielzeuge ausgewählt.
                        </p>
                        <button onClick={() => setLimitModal(false)}
                            className="w-full h-11 rounded-full text-white font-bold text-[14px]"
                            style={{ backgroundColor: BRAND.green, fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                            OK
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
