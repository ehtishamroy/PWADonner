'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BRAND, AGE_RANGES, CONDITIONS, CONDITION_LABELS } from '@/lib/constants';

interface EditDonationModalProps {
    donation: {
        id: string;
        toyName: string;
        category: string;
        ageRange: string;
        condition: string;
        description: string;
    };
    onClose: () => void;
}

export default function EditDonationModal({ donation, onClose }: EditDonationModalProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<string[]>([]);
    const [formData, setFormData] = useState({
        toyName: donation.toyName,
        category: donation.category,
        ageRange: donation.ageRange,
        condition: donation.condition,
        description: donation.description || '',
    });

    // Load categories from the database (same as the donation form)
    useEffect(() => {
        fetch('/api/categories')
            .then(r => r.json())
            .then(d => setCategories(d.categories || []))
            .catch(() => { });
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`/api/admin/donations/${donation.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                alert('Ein Fehler ist aufgetreten.');
                setLoading(false);
                return;
            }

            router.refresh();
            onClose();
        } catch {
            alert('Netzwerkfehler');
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-[32px] p-8 shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                        Spende bearbeiten
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                            Titel
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.toyName}
                            onChange={(e) => setFormData(prev => ({ ...prev, toyName: e.target.value }))}
                            className="w-full px-4 py-3 rounded-[12px] bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#537D61]"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                                Kategorie
                            </label>
                            <select
                                required
                                value={formData.category}
                                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                className="w-full px-4 py-3 rounded-[12px] bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#537D61] appearance-none"
                            >
                                <option value="">Wählen...</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                                Alter
                            </label>
                            <select
                                required
                                value={formData.ageRange}
                                onChange={(e) => setFormData(prev => ({ ...prev, ageRange: e.target.value }))}
                                className="w-full px-4 py-3 rounded-[12px] bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#537D61] appearance-none"
                            >
                                <option value="">Wählen...</option>
                                {AGE_RANGES.map(age => (
                                    <option key={age} value={age}>{age}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                            Zustand
                        </label>
                        <select
                            required
                            value={formData.condition}
                            onChange={(e) => setFormData(prev => ({ ...prev, condition: e.target.value }))}
                            className="w-full px-4 py-3 rounded-[12px] bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#537D61] appearance-none"
                        >
                            <option value="">Wählen...</option>
                            {CONDITIONS.map(cond => (
                                <option key={cond} value={cond}>{CONDITION_LABELS[cond] || cond}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                            Beschreibung
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full px-4 py-3 rounded-[12px] bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#537D61] min-h-[100px]"
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 rounded-full font-bold uppercase tracking-widest text-[12px] transition-transform active:scale-95"
                            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                        >
                            Abbrechen
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 rounded-full text-white font-bold uppercase tracking-widest text-[12px] transition-transform active:scale-95 disabled:opacity-50"
                            style={{ backgroundColor: BRAND.green, fontFamily: "'Bricolage Grotesque', sans-serif" }}
                        >
                            {loading ? 'Speichern...' : 'Speichern'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
