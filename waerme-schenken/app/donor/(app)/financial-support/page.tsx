'use client';

import { useEffect, useState, useRef } from 'react';
import { de } from '@/lib/i18n/de';
import { BRAND } from '@/lib/constants';
import { UploadCloud, X, Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

const MAX_IMAGES = 5;
const MAX_SIZE_MB = 5;

type Reimbursement = {
    id: string;
    amount: number;
    status: 'pending' | 'approved' | 'paid' | 'rejected';
    createdAt: string;
    images: { imageUrl: string }[];
    donation?: { id: string; toyName: string };
};

type Donation = {
    id: string;
    toyName: string;
    status: string;
};

export default function FinancialSupportPage() {
    const [phoneNumber, setPhoneNumber] = useState<string>('');
    const [phoneLoading, setPhoneLoading] = useState(false);
    const [phoneSaved, setPhoneSaved] = useState(false);

    const [donations, setDonations] = useState<Donation[]>([]);
    const [reimbursements, setReimbursements] = useState<Reimbursement[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedDonation, setSelectedDonation] = useState<string>('');
    const [amount, setAmount] = useState<string>('');
    const [images, setImages] = useState<{ file: File; url: string }[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState(false);

    const fileRef = useRef<HTMLInputElement>(null);

    // Load phone number and data
    useEffect(() => {
        Promise.all([
            fetch('/api/donor/phone').then(r => r.json()),
            fetch('/api/donor/reimbursement').then(r => r.json()),
            fetch('/api/donations').then(r => r.json())
        ]).then(([phoneData, reimbData, donoData]) => {
            setPhoneNumber(phoneData.phoneNumber || '');
            const allReimb: Reimbursement[] = reimbData.reimbursements || [];
            setReimbursements(allReimb);
            // /api/donations returns a plain array
            const allDonations: Donation[] = Array.isArray(donoData) ? donoData : [];
            // Only show sent donations that don't already have a reimbursement
            const existingDonationIds = new Set(allReimb.map((r: Reimbursement) => r.donation?.id).filter(Boolean));
            const availableDonations = allDonations.filter(
                (d: Donation) => d.status === 'sent' && !existingDonationIds.has(d.id)
            );
            setDonations(availableDonations);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    async function savePhone() {
        setPhoneLoading(true);
        try {
            const res = await fetch('/api/donor/phone', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber })
            });
            if (res.ok) {
                setPhoneSaved(true);
                setTimeout(() => setPhoneSaved(false), 2000);
            }
        } finally {
            setPhoneLoading(false);
        }
    }

    function handleImageAdd(files: FileList | null) {
        if (!files) return;

        const oversized: string[] = [];
        const valid = Array.from(files).filter((f) => {
            if (f.size > MAX_SIZE_MB * 1024 * 1024) {
                oversized.push(f.name);
                return false;
            }
            return true;
        });

        if (oversized.length > 0) {
            setError(`Bild zu gross (max ${MAX_SIZE_MB}MB)`);
            return;
        }

        const remaining = MAX_IMAGES - images.length;
        if (remaining <= 0) {
            setError(`Maximal ${MAX_IMAGES} Bilder erlaubt`);
            return;
        }

        const toAdd = valid.slice(0, remaining).map(file => ({
            file,
            url: URL.createObjectURL(file)
        }));

        setImages(prev => [...prev, ...toAdd]);
        setError('');
    }

    function removeImage(idx: number) {
        setImages(prev => {
            const img = prev[idx];
            if (img) URL.revokeObjectURL(img.url);
            return prev.filter((_, i) => i !== idx);
        });
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedDonation || !amount || images.length === 0) {
            setError('Bitte fülle alle Felder aus und lade mindestens 1 Bild hoch');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('donationId', selectedDonation);
            formData.append('amount', amount);
            images.forEach((img, i) => formData.append(`image${i}`, img.file));

            const res = await fetch('/api/donor/reimbursement', {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                setSuccess(true);
                // Reset form
                setSelectedDonation('');
                setAmount('');
                images.forEach(img => URL.revokeObjectURL(img.url));
                setImages([]);
                // Reload reimbursements
                const reimbRes = await fetch('/api/donor/reimbursement');
                const reimbData = await reimbRes.json();
                setReimbursements(reimbData.reimbursements || []);
                setTimeout(() => setSuccess(false), 3000);
            } else {
                const data = await res.json();
                setError(data.error || 'Fehler beim Einreichen');
            }
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin" size={32} />
            </div>
        );
    }

    return (
        <div className="pt-12 px-5 pb-24 overflow-x-hidden">
            <div className="max-w-md mx-auto">
                {/* Back */}
                <Link href="/donor/dashboard" className="inline-flex items-center gap-2 mb-6">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M12 5L7 10L12 15" stroke={BRAND.green} strokeWidth="2.5" strokeLinecap="round"/>
                    </svg>
                    <span className="font-bold uppercase tracking-widest text-sm"
                        style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                        Zurück
                    </span>
                </Link>

                <h1 className="mb-6" style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: '27px', lineHeight: '30px' }}>
                    Versandkosten erstatten
                </h1>

                {/* Phone Number Section */}
                <div className="bg-white rounded-[8px] p-6 shadow-sm mb-6">
                    <h3 className="font-bold mb-2">Deine Twint-Nummer</h3>
                    <p className="text-sm opacity-70 mb-4">
                        Wir erstatten die Versandkosten via Twint. Bitte gib deine Mobilnummer ein.
                    </p>
                    <div className="flex gap-3">
                        <input
                            type="tel"
                            value={phoneNumber}
                            onChange={e => setPhoneNumber(e.target.value)}
                            placeholder="+41 79 123 45 67"
                            className="flex-1 font-bold text-[17px] bg-transparent outline-none border-b-2 border-gray-100 focus:border-gray-300 pb-2"
                        />
                        <button
                            onClick={savePhone}
                            disabled={phoneLoading}
                            className="px-4 py-2 rounded-full text-white font-bold text-sm"
                            style={{ backgroundColor: BRAND.green }}
                        >
                            {phoneLoading ? <Loader2 size={16} className="animate-spin" /> : phoneSaved ? '✓' : 'Speichern'}
                        </button>
                    </div>
                </div>

                {/* Success message */}
                {success && (
                    <div className="bg-green-50 rounded-[8px] p-4 mb-6 flex items-center gap-3">
                        <CheckCircle2 size={24} style={{ color: BRAND.green }} />
                        <p className="font-bold">Antrag erfolgreich eingereicht!</p>
                    </div>
                )}

                {/* New Reimbursement Form */}
                {donations.length > 0 ? (
                    <form onSubmit={handleSubmit} className="bg-white rounded-[8px] p-6 shadow-sm mb-6">
                        <h3 className="font-bold mb-4">Neuer Antrag</h3>

                        {error && <p className="text-sm font-bold mb-4" style={{ color: BRAND.error }}>{error}</p>}

                        {/* Select Donation */}
                        <div className="mb-5">
                            <label className="block mb-2 text-sm font-bold">Spende auswählen</label>
                            <select
                                value={selectedDonation}
                                onChange={e => setSelectedDonation(e.target.value)}
                                className="w-full p-3 rounded-lg border border-gray-200 font-bold"
                            >
                                <option value="">-- Wähle eine Spende --</option>
                                {donations.map(d => (
                                    <option key={d.id} value={d.id}>{d.toyName}</option>
                                ))}
                            </select>
                        </div>

                        {/* Amount */}
                        <div className="mb-5">
                            <label className="block mb-2 text-sm font-bold">Versandkosten (CHF)</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                placeholder="z.B. 8.50"
                                className="w-full font-bold text-[17px] bg-transparent outline-none border-b-2 border-gray-100 focus:border-gray-300 pb-2"
                            />
                        </div>

                        {/* Receipt Images */}
                        <div className="mb-5">
                            <label className="block mb-2 text-sm font-bold">Post-Quittung (max. 5 Bilder)</label>
                            <input
                                ref={fileRef}
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={e => handleImageAdd(e.target.files)}
                            />

                            <div className="grid grid-cols-3 gap-3 mb-3">
                                {images.map((img, i) => (
                                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(i)}
                                            className="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                                {images.length < MAX_IMAGES && (
                                    <button
                                        type="button"
                                        onClick={() => fileRef.current?.click()}
                                        className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 hover:border-gray-400"
                                    >
                                        <UploadCloud size={24} className="opacity-50" />
                                        <span className="text-xs opacity-50">Foto</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting || !selectedDonation || !amount || images.length === 0}
                            className="w-full h-12 rounded-full text-white font-bold uppercase tracking-widest text-[14px] disabled:opacity-50"
                            style={{ backgroundColor: BRAND.green, fontFamily: "'Bricolage Grotesque',sans-serif" }}
                        >
                            {submitting ? <Loader2 size={20} className="animate-spin mx-auto" /> : 'Antrag einreichen'}
                        </button>
                    </form>
                ) : (
                    <div className="bg-gray-50 rounded-[8px] p-6 text-center mb-6">
                        <p className="opacity-70">Keine ausstehenden Spenden für Erstattung.</p>
                    </div>
                )}

                {/* Past Reimbursements */}
                {reimbursements.length > 0 && (
                    <div>
                        <h3 className="font-bold mb-4">Deine Anträge</h3>
                        <div className="space-y-3">
                            {reimbursements.map(r => (
                                <div key={r.id} className="bg-white rounded-[8px] p-4 shadow-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-bold">{r.donation?.toyName || 'Spende'}</p>
                                            <p className="text-sm opacity-70">{new Date(r.createdAt).toLocaleDateString('de-CH')}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                            r.status === 'paid' ? 'bg-green-100 text-green-700' :
                                            r.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                            r.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                            {r.status === 'paid' ? 'Bezahlt' :
                                             r.status === 'pending' ? 'Prüfung' :
                                             r.status === 'approved' ? 'Genehmigt' : 'Abgelehnt'}
                                        </span>
                                    </div>
                                    <p className="font-bold text-lg">CHF {r.amount.toFixed(2)}</p>
                                    {r.images.length > 0 && (
                                        <div className="flex gap-2 mt-3">
                                            {r.images.map((img, i) => (
                                                <a key={i} href={img.imageUrl} target="_blank" rel="noopener noreferrer"
                                                   className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden">
                                                    <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
