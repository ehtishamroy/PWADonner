'use client';

import { useState, useRef, useEffect } from 'react';
import { UploadCloud, Check, ChevronDown, AlertTriangle, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { BRAND } from '@/lib/constants';

type Props = {
    currentUrl:  string | null;
    currentOrg:  string | null;
    isApproved:  boolean;
};

type Phase = 'idle' | 'uploading' | 'saving' | 'done' | 'error';

export function SocialCardUpdate({ currentUrl, currentOrg, isApproved }: Props) {
    const [orgs, setOrgs]               = useState<string[]>([]);
    const [orgOpen, setOrgOpen]         = useState(false);
    const [selectedOrg, setSelectedOrg] = useState<string>(currentOrg ?? '');
    const [uploadedUrl, setUploadedUrl] = useState<string>(currentUrl ?? '');
    const [phase, setPhase]             = useState<Phase>('idle');
    const [errorMsg, setErrorMsg]       = useState('');
    const [showForm, setShowForm]       = useState(!currentUrl); // auto-open if no card

    const fileRef = useRef<HTMLInputElement>(null);

    const hasNewCard   = !!uploadedUrl && uploadedUrl !== currentUrl;
    const hasNewOrg    = selectedOrg !== (currentOrg ?? '');
    const isDirty      = hasNewCard || hasNewOrg;
    const canSave      = !!uploadedUrl && !!selectedOrg && isDirty;

    useEffect(() => {
        fetch('/api/orgs')
            .then(r => r.json())
            .then(d => setOrgs(d.orgs || []))
            .catch(() => {});
    }, []);

    async function handleFile(file: File | undefined) {
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            setErrorMsg('Die Datei ist zu gross. Bitte wähle ein Bild unter 5 MB.');
            setPhase('error');
            return;
        }
        setPhase('uploading');
        setErrorMsg('');
        try {
            const fd = new FormData();
            fd.append('file', file);
            const res  = await fetch('/api/upload/social-card', { method: 'POST', body: fd });
            if (!res.ok) {
                if (res.status === 413) {
                    throw new Error('Die Datei ist zu gross. Bitte wähle ein Bild unter 5 MB.');
                }
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || `Upload fehlgeschlagen (HTTP ${res.status}).`);
            }
            const data = await res.json();
            setUploadedUrl(data.url);
            setPhase('idle');
        } catch (e: unknown) {
            setErrorMsg(e instanceof Error ? e.message : 'Upload fehlgeschlagen.');
            setPhase('error');
        }
    }

    async function handleSave() {
        if (!canSave) return;
        setPhase('saving');
        setErrorMsg('');
        try {
            const res  = await fetch('/api/family/social-card', {
                method:  'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ socialCardUrl: uploadedUrl, socialCardOrg: selectedOrg }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Speichern fehlgeschlagen.');
            setPhase('done');
            setShowForm(false);
        } catch (e: unknown) {
            setErrorMsg(e instanceof Error ? e.message : 'Speichern fehlgeschlagen.');
            setPhase('error');
        }
    }

    const isUploading = phase === 'uploading';
    const isSaving    = phase === 'saving';
    const uploaded    = !!uploadedUrl;

    // Hide entirely for approved families — nothing to do until next season reset
    if (isApproved && phase !== 'done') return null;

    return (
        <div className="bg-white rounded-[8px] p-7 shadow-sm mb-4">
            {/* Header row */}
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3
                        className="text-[11px] font-bold uppercase tracking-widest opacity-30 mb-1"
                        style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}
                    >
                        Sozialausweis
                    </h3>

                    {/* Status badge */}
                    {phase === 'done' ? (
                        <div className="flex items-center gap-1.5 text-sm font-bold" style={{ color: BRAND.green }}>
                            <CheckCircle2 size={15} />
                            Hochgeladen — wartet auf Admin-Freigabe
                        </div>
                    ) : currentUrl && isApproved ? (
                        <div className="flex items-center gap-1.5 text-sm font-bold" style={{ color: BRAND.green }}>
                            <CheckCircle2 size={15} />
                            Genehmigt
                        </div>
                    ) : currentUrl && !isApproved ? (
                        <div className="flex items-center gap-1.5 text-sm font-bold text-yellow-600">
                            <AlertTriangle size={15} />
                            Hochgeladen — wartet auf Admin-Freigabe
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 text-sm font-bold text-red-600">
                            <AlertTriangle size={15} />
                            Kein Sozialausweis hochgeladen
                        </div>
                    )}
                </div>

                {/* Update / collapse toggle */}
                <button
                    onClick={() => {
                        setShowForm(f => !f);
                        // reset to current values when collapsing
                        if (showForm) {
                            setUploadedUrl(currentUrl ?? '');
                            setSelectedOrg(currentOrg ?? '');
                            setPhase('idle');
                            setErrorMsg('');
                        }
                    }}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border transition-colors"
                    style={{
                        borderColor: BRAND.green,
                        color:       BRAND.green,
                    }}
                >
                    <RefreshCw size={12} />
                    {showForm ? 'Abbrechen' : 'Aktualisieren'}
                </button>
            </div>

            {/* Current card preview (when not editing) */}
            {!showForm && currentUrl && (
                <div className="flex items-center gap-3">
                    <a href={currentUrl} target="_blank" rel="noopener noreferrer"
                        className="w-16 h-16 rounded-[8px] overflow-hidden bg-gray-100 shrink-0 hover:opacity-80 transition-opacity">
                        <img src={currentUrl} alt="Sozialausweis" className="w-full h-full object-cover" />
                    </a>
                    {currentOrg && (
                        <p className="text-sm font-bold opacity-60">{currentOrg}</p>
                    )}
                </div>
            )}

            {/* Upload form */}
            {showForm && (
                <div className="space-y-4 mt-2">
                    {/* Info note */}
                    {currentUrl && (
                        <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-[6px] border border-yellow-200 text-xs text-yellow-800">
                            <AlertTriangle size={13} className="shrink-0 mt-0.5" />
                            Nach dem Hochladen muss dein Ausweis erneut vom Admin genehmigt werden.
                        </div>
                    )}

                    {/* Org dropdown */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setOrgOpen(o => !o)}
                            className="w-full h-11 px-5 rounded-full flex justify-between items-center text-white shadow-md transition-opacity hover:opacity-95"
                            style={{
                                backgroundColor: BRAND.green,
                                fontFamily: "'Bricolage Grotesque',sans-serif",
                                fontWeight: 700,
                                fontSize: '14px',
                            }}
                        >
                            <span>{selectedOrg || 'Organisation wählen'}</span>
                            <ChevronDown size={18} className={`transition-transform ${orgOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {orgOpen && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-[12px] shadow-xl overflow-hidden z-50 border border-gray-100">
                                {orgs.map((o, i) => (
                                    <button key={o} type="button"
                                        onClick={() => { setSelectedOrg(o); setOrgOpen(false); }}
                                        className={`w-full text-left px-5 py-3 text-sm font-bold transition-colors hover:bg-gray-50 ${i < orgs.length - 1 ? 'border-b border-gray-50' : ''}`}
                                        style={{
                                            color:           o === selectedOrg ? BRAND.green : '#000',
                                            fontFamily:      "'Bricolage Grotesque',sans-serif",
                                            backgroundColor: o === selectedOrg ? 'rgba(83,125,97,0.08)' : '#fff',
                                        }}
                                    >
                                        {o}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Upload zone */}
                    <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        disabled={isUploading || isSaving}
                        className="w-full rounded-[8px] flex flex-col items-center justify-center py-10 px-6 gap-3 transition-colors disabled:opacity-60"
                        style={{ backgroundColor: '#EBE6DE' }}
                    >
                        <div
                            className="w-12 h-12 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: BRAND.green }}
                        >
                            {isUploading
                                ? <Loader2 size={22} color="#fff" className="animate-spin" />
                                : uploaded
                                ? <Check size={24} color="#fff" strokeWidth={3} />
                                : <UploadCloud size={24} color="#fff" />}
                        </div>
                        <span
                            className="text-sm"
                            style={{
                                color:      uploaded ? BRAND.green : 'rgb(73,69,79)',
                                fontWeight: uploaded ? 600 : 400,
                            }}
                        >
                            {isUploading
                                ? 'Wird hochgeladen…'
                                : uploaded
                                ? hasNewCard
                                    ? 'Neues Bild bereit ✓'
                                    : 'Aktuelles Bild'
                                : 'Sozialausweis hochladen (JPG, PNG, max. 5 MB)'}
                        </span>
                    </button>
                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        hidden
                        onChange={e => handleFile(e.target.files?.[0])}
                    />

                    {/* Error */}
                    {phase === 'error' && (
                        <p className="text-xs font-medium" style={{ color: BRAND.error }}>{errorMsg}</p>
                    )}

                    {/* Save button */}
                    <button
                        onClick={handleSave}
                        disabled={!canSave || isSaving || isUploading}
                        className="w-full h-11 rounded-full text-white font-bold text-sm transition-all active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2"
                        style={{
                            backgroundColor: canSave ? BRAND.greenDark : '#9CA3AF',
                            fontFamily: "'Bricolage Grotesque',sans-serif",
                        }}
                    >
                        {isSaving ? <><Loader2 size={16} className="animate-spin" /> Wird gespeichert…</> : 'Sozialausweis speichern'}
                    </button>
                </div>
            )}
        </div>
    );
}
