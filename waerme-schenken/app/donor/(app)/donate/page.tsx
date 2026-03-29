'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { de } from '@/lib/i18n/de';
import { BRAND, TOY_CATEGORIES, AGE_RANGES, CONDITIONS, CONDITION_LABELS } from '@/lib/constants';
import { UploadCloud, X } from 'lucide-react';
import Image from 'next/image';

type Step = 1 | 2 | 3;

const MAX_IMAGES = 3;
const MAX_SIZE_MB = 3;

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
    const router   = useRouter();
    const [step, setStep]   = useState<Step>(1);
    const [form, setForm]   = useState({
        toyName: '', category: '', ageRange: '', condition: '', description: '',
    });
    const [images, setImages]   = useState<{ file: File; url: string }[]>([]);
    const [errors, setErrors]   = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const fileRef               = useRef<HTMLInputElement>(null);

    function validateStep1() {
        const e: Record<string, string> = {};
        if (!form.toyName.trim())     e.toyName     = de.auth.errors.required;
        if (!form.category)           e.category    = de.auth.errors.required;
        if (!form.ageRange)           e.ageRange    = 'Bitte wähle eine Altersgruppe.';
        if (!form.condition)          e.condition   = 'Bitte wähle einen Zustand.';
        if (!form.description.trim()) e.description = de.auth.errors.required;
        return e;
    }

    function validateStep2() {
        const e: Record<string, string> = {};
        if (images.length === 0) e.images = 'Bitte lade mindestens 1 Foto hoch.';
        return e;
    }

    function handleImageAdd(files: FileList | null) {
        if (!files) return;
        // Reset file input so same files can be re-selected / picker opens fresh
        if (fileRef.current) fileRef.current.value = '';
        const oversized: string[] = [];
        const valid = Array.from(files).filter((f) => {
            if (f.size > MAX_SIZE_MB * 1024 * 1024) {
                oversized.push(f.name);
                return false;
            }
            return true;
        });

        if (oversized.length > 0) {
            setErrors(prev => ({ ...prev, images: `Folgende Bilder sind grösser als ${MAX_SIZE_MB}MB: ${oversized.join(', ')}` }));
        }

        const remaining = MAX_IMAGES - images.length;
        if (remaining <= 0) {
            setErrors(prev => ({ ...prev, images: `Maximal ${MAX_IMAGES} Fotos erlaubt.` }));
            return;
        }

        const toAdd = valid.slice(0, remaining).map((file) => ({ file, url: URL.createObjectURL(file) }));
        if (valid.length > remaining) {
            setErrors(prev => ({ ...prev, images: `Maximal ${MAX_IMAGES} Fotos erlaubt. Nur ${remaining} wurden hinzugefügt.` }));
        } else {
            setErrors(prev => { const next = { ...prev }; delete next.images; return next; });
        }
        setImages((prev) => [...prev, ...toAdd].slice(0, MAX_IMAGES));
    }

    async function handleSubmit() {
        if (!confirm('Möchtest du diese Spende jetzt endgültig einreichen?')) return;
        setLoading(true);
        try {
            const imageUrls: string[] = [];
            for (const img of images) {
                const fd = new FormData();
                fd.append('file', img.file);
                const res = await fetch('/api/upload', { method: 'POST', body: fd });
                if (res.ok) { const { url } = await res.json(); imageUrls.push(url); }
            }
            const res = await fetch('/api/donations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, imageUrls }),
            });
            if (!res.ok) throw new Error('Server error');
            router.replace('/donor/dashboard?success=1');
        } catch {
            setErrors({ submit: de.common.error });
        } finally {
            setLoading(false);
        }
    }

    const field = (key: keyof typeof form, label: string, placeholder?: string) => (
        <div>
            <label className="text-xs font-bold uppercase tracking-widest opacity-40 block mb-1.5"
                style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>{label}</label>
            <div className="border-b-2 pb-2" style={{ borderColor: errors[key] ? BRAND.error : '#E5E7EB' }}>
                <input type="text" value={form[key]}
                    placeholder={placeholder}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full bg-transparent outline-none font-bold text-[16px] placeholder:opacity-30" />
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
                        {field('toyName', de.donate.toyName, 'z.B. LEGO Technic Set')}

                        {/* Category */}
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
                                        className="px-3 py-1.5 rounded-full text-[12px] font-bold border-2 transition-colors"
                                        style={{
                                            borderColor:     form.ageRange === a ? BRAND.green : '#E5E7EB',
                                            backgroundColor: form.ageRange === a ? BRAND.green : 'transparent',
                                            color:           form.ageRange === a ? '#fff' : '#000',
                                        }}>
                                        {a}
                                    </button>
                                ))}
                            </div>
                            {errors.ageRange && <p className="text-[11px] mt-1" style={{ color: BRAND.error }}>{errors.ageRange}</p>}
                        </div>

                        {/* Condition */}
                        <div>
                            <label className="text-xs font-bold uppercase tracking-widest opacity-40 block mb-2"
                                style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>{de.donate.condition}</label>
                            <div className="flex flex-col gap-2">
                                {CONDITIONS.map((c: string) => (
                                    <button key={c} type="button"
                                        onClick={() => setForm(f => ({ ...f, condition: c }))}
                                        className="px-4 py-2.5 rounded-full text-[13px] font-bold border-2 transition-colors text-left"
                                        style={{
                                            borderColor:     form.condition === c ? BRAND.green : '#E5E7EB',
                                            backgroundColor: form.condition === c ? BRAND.green : 'transparent',
                                            color:           form.condition === c ? '#fff' : '#000',
                                        }}>
                                        {CONDITION_LABELS[c]}
                                    </button>
                                ))}
                            </div>
                            {errors.condition && <p className="text-[11px] mt-1" style={{ color: BRAND.error }}>{errors.condition}</p>}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="text-xs font-bold uppercase tracking-widest opacity-40 block mb-1.5"
                                style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>{de.donate.description}</label>
                            <textarea value={form.description} rows={3}
                                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                placeholder={de.donate.descriptionPlaceholder}
                                className="w-full bg-transparent outline-none font-medium text-[15px] resize-none border-b-2 pb-2 placeholder:opacity-30"
                                style={{ borderColor: errors.description ? BRAND.error : '#E5E7EB' }} />
                            {errors.description && <p className="text-[11px] mt-1" style={{ color: BRAND.error }}>{errors.description}</p>}
                        </div>
                    </div>
                )}

                {/* Step 2 — Images */}
                {step === 2 && (
                    <div className="bg-white rounded-[28px] p-7 shadow-sm flex flex-col items-center">
                        <h2 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: '20px' }} className="mb-2 self-start">
                            {de.donate.uploadImages}
                        </h2>
                        <p className="text-[12px] opacity-50 mb-5 self-start">
                            Max. {MAX_IMAGES} Fotos · max. {MAX_SIZE_MB} MB pro Foto · mind. 1 Foto erforderlich
                        </p>

                        {/* Upload grid */}
                        <div className="w-full flex flex-col items-center gap-3">
                            {images.length === 0 ? (
                                // Empty state — large upload zone only
                                <button onClick={() => fileRef.current?.click()}
                                    className="w-full py-10 rounded-[16px] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-3 bg-gray-50 hover:bg-gray-100 transition-colors">
                                    <UploadCloud size={36} strokeWidth={1.5} color={BRAND.green} />
                                    <span className="text-[13px] opacity-60 font-medium">Fotos hochladen</span>
                                    <span className="text-[11px] opacity-40">PNG, JPG bis {MAX_SIZE_MB} MB (max. {MAX_IMAGES} Fotos)</span>
                                </button>
                            ) : (
                                // Has images — grid with previews + add-more slot
                                <div className="grid grid-cols-3 gap-3 w-full">
                                    {images.map((img, i) => (
                                        <div key={i} className="relative aspect-square rounded-[16px] overflow-hidden">
                                            <img src={img.url} alt="" className="w-full h-full object-cover" />
                                            <button onClick={() => setImages(prev => prev.filter((_, j) => j !== i))}
                                                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center text-white">
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    {images.length < MAX_IMAGES && (
                                        <button onClick={() => fileRef.current?.click()}
                                            className="aspect-square rounded-[16px] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 transition-colors">
                                            <UploadCloud size={28} strokeWidth={1.5} color={BRAND.green} />
                                            <span className="text-[10px] opacity-50 text-center px-1">Hinzufügen</span>
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden
                            onChange={e => handleImageAdd(e.target.files)} />

                        {errors.images && (
                            <p className="text-[12px] mt-3 text-center font-medium" style={{ color: BRAND.error }}>{errors.images}</p>
                        )}
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
                            { label: de.donate.ageRange,   value: form.ageRange },
                            { label: de.donate.condition,  value: CONDITION_LABELS[form.condition] || form.condition },
                            { label: de.donate.description, value: form.description },
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
                            if (step === 2) {
                                const e = validateStep2();
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
