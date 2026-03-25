'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { de } from '@/lib/i18n/de';
import { BRAND, TOY_CATEGORIES, AGE_RANGES, CONDITIONS, CONDITION_LABELS } from '@/lib/constants';
import { UploadCloud, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

type Step = 1 | 2 | 3;

function StepBar({ step }: { step: Step }) {
    return (
        <div className="flex gap-2 mb-8">
            {[1, 2, 3].map((s) => (
                <div key={s} className="h-1 flex-1 rounded-full transition-all"
                    style={{ backgroundColor: s <= step ? BRAND.greenDark : '#fff' }} />
            ))}
        </div>
    );
}

export default function DonorDonatePage() {
    const router  = useRouter();
    const [step, setStep] = useState<Step>(1);
    const [form, setForm] = useState({
        toyName: '', category: '', ageRange: '', condition: '', description: '',
    });
    const [images, setImages]  = useState<{ file: File; url: string }[]>([]);
    const [errors, setErrors]  = useState<Record<string, string>>({});
    const [loading, setLoading]= useState(false);
    const fileRef              = useRef<HTMLInputElement>(null);

    function validateStep1() {
        const e: Record<string, string> = {};
        if (!form.toyName.trim())   e.toyName    = de.auth.errors.required;
        if (!form.category)         e.category   = de.auth.errors.required;
        if (!form.ageRange)         e.ageRange   = de.auth.errors.required;
        if (!form.condition)        e.condition  = de.auth.errors.required;
        if (!form.description.trim()) e.description = de.auth.errors.required;
        return e;
    }

    function handleImageAdd(files: FileList | null) {
        if (!files) return;
        const newImgs = Array.from(files).slice(0, 5 - images.length).map((file) => ({
            file,
            url: URL.createObjectURL(file),
        }));
        setImages((prev) => [...prev, ...newImgs].slice(0, 5));
    }

    async function handleSubmit() {
        setLoading(true);
        try {
            // 1. Upload images
            const imageUrls: string[] = [];
            for (const img of images) {
                const fd = new FormData();
                fd.append('file', img.file);
                const res = await fetch('/api/upload', { method: 'POST', body: fd });
                if (res.ok) {
                    const { url } = await res.json();
                    imageUrls.push(url);
                }
            }
            // 2. Create donation
            const res = await fetch('/api/donations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, imageUrls }),
            });
            if (!res.ok) throw new Error('Server error');
            router.replace('/donor/dashboard');
        } catch {
            setErrors({ submit: de.common.error });
        } finally {
            setLoading(false);
        }
    }

    const field = (key: keyof typeof form, label: string, type?: string) => (
        <div>
            <label className="text-xs font-bold uppercase tracking-widest opacity-40 block mb-1.5"
                style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>{label}</label>
            <div className="border-b-2 pb-2" style={{ borderColor: errors[key] ? BRAND.error : '#E5E7EB' }}>
                <input type={type || 'text'} value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full bg-transparent outline-none font-bold text-[16px]" />
            </div>
            {errors[key] && <p className="text-[11px] mt-1" style={{ color: BRAND.error }}>{errors[key]}</p>}
        </div>
    );

    return (
        <div className="min-h-screen pt-12 px-5 pb-28 flex flex-col items-center" style={{ backgroundColor: BRAND.beige }}>
            <div className="max-w-md w-full">
                <h1 className="mb-6" style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: '27px', lineHeight: '30px' }}>
                    {de.donate.heading}
                </h1>
                <StepBar step={step} />

                {/* Step 1 — Details */}
                {step === 1 && (
                    <div className="bg-white rounded-[28px] p-7 shadow-sm space-y-6">
                        {field('toyName', de.donate.toyName)}

                        {/* Category select */}
                        <div>
                            <label className="text-xs font-bold uppercase tracking-widest opacity-40 block mb-1.5"
                                style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>{de.donate.category}</label>
                            <div className="border-b-2 pb-2" style={{ borderColor: errors.category ? BRAND.error : '#E5E7EB' }}>
                                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                                    className="w-full bg-transparent outline-none font-bold text-[16px] cursor-pointer">
                                    <option value="">Wählen...</option>
                                    {TOY_CATEGORIES.map((c: string) => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            {errors.category && <p className="text-[11px] mt-1" style={{ color: BRAND.error }}>{errors.category}</p>}
                        </div>

                        {/* Age range */}
                        <div>
                            <label className="text-xs font-bold uppercase tracking-widest opacity-40 block mb-2"
                                style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>{de.donate.ageRange}</label>
                            <div className="flex flex-wrap gap-2">
                                {AGE_RANGES.map((a: string) => (
                                    <button key={a} type="button"
                                        onClick={() => setForm(f => ({ ...f, ageRange: a }))}
                                        className="px-4 py-1.5 rounded-full text-[13px] font-bold border-2 transition-colors"
                                        style={{
                                            borderColor:     form.ageRange === a ? BRAND.green : '#E5E7EB',
                                            backgroundColor: form.ageRange === a ? BRAND.green : 'transparent',
                                            color:           form.ageRange === a ? '#fff' : '#000',
                                        }}>
                                        {a}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Condition */}
                        <div>
                            <label className="text-xs font-bold uppercase tracking-widest opacity-40 block mb-2"
                                style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>{de.donate.condition}</label>
                            <div className="flex gap-3">
                                {CONDITIONS.map((c: string) => (
                                    <button key={c} type="button"
                                        onClick={() => setForm(f => ({ ...f, condition: c }))}
                                        className="px-4 py-2 rounded-full text-[13px] font-bold border-2 transition-colors"
                                        style={{
                                            borderColor:     form.condition === c ? BRAND.green : '#E5E7EB',
                                            backgroundColor: form.condition === c ? BRAND.green : 'transparent',
                                            color:           form.condition === c ? '#fff' : '#000',
                                        }}>
                                        {CONDITION_LABELS[c]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="text-xs font-bold uppercase tracking-widest opacity-40 block mb-1.5"
                                style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>{de.donate.description}</label>
                            <textarea value={form.description} rows={3}
                                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                placeholder={de.donate.descriptionPlaceholder}
                                className="w-full bg-transparent outline-none font-medium text-[15px] resize-none border-b-2 pb-2"
                                style={{ borderColor: errors.description ? BRAND.error : '#E5E7EB' }} />
                        </div>
                    </div>
                )}

                {/* Step 2 — Images */}
                {step === 2 && (
                    <div className="bg-white rounded-[28px] p-7 shadow-sm">
                        <h2 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: '20px' }} className="mb-5">
                            {de.donate.uploadImages}
                        </h2>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            {images.map((img, i) => (
                                <div key={i} className="relative aspect-square rounded-[16px] overflow-hidden">
                                    <Image src={img.url} alt="" fill className="object-cover" />
                                    <button onClick={() => setImages(prev => prev.filter((_, j) => j !== i))}
                                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center text-white">
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                            {images.length < 5 && (
                                <button onClick={() => fileRef.current?.click()}
                                    className="aspect-square rounded-[16px] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 transition-colors">
                                    <UploadCloud size={28} strokeWidth={1.5} color={BRAND.green} />
                                    <span className="text-[11px] opacity-50">{de.donate.uploadHint}</span>
                                </button>
                            )}
                        </div>
                        <input ref={fileRef} type="file" accept="image/*" multiple hidden
                            onChange={e => handleImageAdd(e.target.files)} />
                        <p className="text-[11px] opacity-40 text-center">{de.donate.uploadHint.split('(')[1]?.replace(')', '') || ''}</p>
                    </div>
                )}

                {/* Step 3 — Review */}
                {step === 3 && (
                    <div className="bg-white rounded-[28px] p-7 shadow-sm space-y-4">
                        <h2 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: '20px' }}>
                            {de.donate.reviewTitle}
                        </h2>
                        {[
                            { label: de.donate.toyName,    value: form.toyName },
                            { label: de.donate.category,   value: form.category },
                            { label: de.donate.ageRange,   value: `${form.ageRange} Jahre` },
                            { label: de.donate.condition,  value: CONDITION_LABELS[form.condition] || form.condition },
                            { label: de.donate.description,value: form.description },
                        ].map(({ label, value }) => (
                            <div key={label} className="border-b border-gray-100 pb-3">
                                <p className="text-[11px] font-bold uppercase tracking-widest opacity-40"
                                    style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>{label}</p>
                                <p className="font-medium text-[15px] mt-0.5">{value}</p>
                            </div>
                        ))}
                        {images.length > 0 && (
                            <div className="flex gap-2 mt-2 flex-wrap">
                                {images.map((img, i) => (
                                    <div key={i} className="w-16 h-16 rounded-xl overflow-hidden">
                                        <Image src={img.url} alt="" width={64} height={64} className="object-cover w-full h-full" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {errors.submit && <p className="text-[13px] mt-3 text-center" style={{ color: BRAND.error }}>{errors.submit}</p>}

                {/* Navigation */}
                <div className="mt-8 flex flex-col items-center gap-3">
                    {step < 3 ? (
                        <button onClick={() => {
                            if (step === 1) {
                                const e = validateStep1();
                                if (Object.keys(e).length) { setErrors(e); return; }
                                setErrors({});
                            }
                            setStep((s) => (s + 1) as Step);
                        }}
                            className="w-full py-5 rounded-full text-white shadow-xl transition-transform active:scale-95"
                            style={{ backgroundColor: BRAND.green, fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: '14px', letterSpacing: '0.1em' }}>
                            {de.common.next.toUpperCase()}
                        </button>
                    ) : (
                        <button onClick={handleSubmit} disabled={loading}
                            className="w-full py-5 rounded-full text-white shadow-xl transition-transform active:scale-95 disabled:opacity-60"
                            style={{ backgroundColor: BRAND.green, fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: '14px', letterSpacing: '0.1em' }}>
                            {loading ? de.donate.submitting.toUpperCase() : de.donate.submit.toUpperCase()}
                        </button>
                    )}
                    {step > 1 && (
                        <button onClick={() => setStep((s) => (s - 1) as Step)}
                            className="text-sm font-bold underline opacity-60"
                            style={{ color: BRAND.green }}>
                            {de.common.back}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
