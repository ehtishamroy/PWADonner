'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Search, ChevronRight, ChevronDown, Package } from 'lucide-react';
import { BRAND, AGE_RANGES } from '@/lib/constants';
import { de } from '@/lib/i18n/de';

type Category = {
    id: string; name: string; bg: string; count: number;
    imageUrl: string | null;
};

export function CategoryList({ categories }: { categories: Category[] }) {
    const [search, setSearch] = useState('');
    const [ageOpen, setAgeOpen] = useState(false);
    const [ageFilter, setAgeFilter] = useState<string>('');
    const [counts, setCounts] = useState<Record<string, number>>(
        Object.fromEntries(categories.map(c => [c.id, c.count]))
    );

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
                    <Search size={18} color={BRAND.green} />
                </div>
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
            </div>

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
    );
}
