'use client';

import { useState, useEffect } from 'react';
import { BRAND } from '@/lib/constants';
import {
    AlertTriangle, RefreshCw, Lock, Calendar, CheckCircle2,
    Loader2, XCircle, Info, ChevronRight, Trash2,
} from 'lucide-react';

type PreviewData = {
    familiesWithSocialCard: number;
    totalDonations: number;
    totalDonationImages: number;
    totalReimbursementImages: number;
    lastResetAt: string | null;
    nextSeasonFrom: string | null;
    isLocked: boolean;
};

type ResetResult = {
    ok: boolean;
    socialCardsCleared: number;
    socialFilesDeleted: number;
    socialFilesFailed: number;
    donationsDeleted: number;
    donationFilesDeleted: number;
    donationFilesFailed: number;
    executedAt: string;
};

type Phase =
    | 'idle'
    | 'loading-preview'
    | 'confirm-1'
    | 'confirm-2'
    | 'running'
    | 'done'
    | 'error';

function formatDate(iso: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('de-CH', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

function formatDateOnly(iso: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('de-CH', {
        day: '2-digit', month: '2-digit', year: 'numeric',
    });
}

export function SeasonResetPanel({
    initialLastResetAt,
    initialNextSeasonFrom,
}: {
    initialLastResetAt: string | null;
    initialNextSeasonFrom: string | null;
}) {
    const [phase, setPhase]           = useState<Phase>('idle');
    const [preview, setPreview]       = useState<PreviewData | null>(null);
    const [confirmText, setConfirmText] = useState('');
    const [result, setResult]         = useState<ResetResult | null>(null);
    const [errorMsg, setErrorMsg]     = useState('');

    // Next-season date picker state
    const [nextSeasonInput, setNextSeasonInput] = useState<string>(
        initialNextSeasonFrom
            ? new Date(initialNextSeasonFrom).toISOString().split('T')[0]
            : '',
    );
    const [savingDate, setSavingDate]     = useState(false);
    const [dateSaved, setDateSaved]       = useState(false);

    // Derive current lock state from live preview (or fall back to initial props)
    const lastResetAt     = preview?.lastResetAt     ?? initialLastResetAt;
    const nextSeasonFrom  = preview?.nextSeasonFrom  ?? initialNextSeasonFrom;
    const isLocked        = preview?.isLocked ?? (() => {
        if (!initialLastResetAt) return false;
        if (!initialNextSeasonFrom) return true;
        return new Date() < new Date(initialNextSeasonFrom);
    })();

    // Close modal on Escape
    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === 'Escape' && (phase === 'confirm-1' || phase === 'confirm-2')) {
                handleCancel();
            }
        }
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [phase]);

    function handleCancel() {
        setPhase('idle');
        setConfirmText('');
        setPreview(null);
    }

    async function handleOpenConfirm() {
        setPhase('loading-preview');
        try {
            const res  = await fetch('/api/admin/season-reset/preview');
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Vorschau fehlgeschlagen');
            setPreview(data);
            setPhase('confirm-1');
        } catch (e: unknown) {
            setErrorMsg(e instanceof Error ? e.message : 'Unbekannter Fehler');
            setPhase('error');
        }
    }

    async function handleConfirm2() {
        setPhase('running');
        setResult(null);
        try {
            const res  = await fetch('/api/admin/season-reset', { method: 'POST' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Reset fehlgeschlagen');
            setResult(data);
            setPhase('done');
        } catch (e: unknown) {
            setErrorMsg(e instanceof Error ? e.message : 'Unbekannter Fehler');
            setPhase('error');
        }
    }

    async function saveNextSeasonDate() {
        setSavingDate(true);
        setDateSaved(false);
        try {
            const res = await fetch('/api/admin/app-settings', {
                method:  'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ nextSeasonFrom: nextSeasonInput || null }),
            });
            if (!res.ok) throw new Error('Speichern fehlgeschlagen');
            setDateSaved(true);
            setTimeout(() => setDateSaved(false), 2000);
        } catch (e) {
            console.error(e);
        } finally {
            setSavingDate(false);
        }
    }

    const CONFIRM_PHRASE = 'SAISON RESET';
    const confirmMatches = confirmText.trim() === CONFIRM_PHRASE;

    return (
        <>
            {/* ── Panel ─────────────────────────────────────────────────── */}
            <div className="rounded-[12px] border-2 border-red-200 bg-red-50 p-6 md:p-8">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                        <AlertTriangle size={20} className="text-red-600" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-red-700" style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                            Saison-Reset
                        </h3>
                        <span className="text-xs font-bold uppercase tracking-widest text-red-400 bg-red-100 px-2 py-0.5 rounded-full">
                            Gefahrenzone
                        </span>
                    </div>
                </div>

                {/* What happens summary */}
                <div className="bg-white rounded-[8px] p-4 mb-5 border border-red-100 space-y-2 text-sm">
                    <p className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <Info size={15} className="text-gray-400" /> Was beim Reset passiert:
                    </p>
                    <div className="space-y-1.5">
                        <div className="flex items-start gap-2 text-red-700">
                            <XCircle size={15} className="shrink-0 mt-0.5" />
                            <span>Alle <strong>Social-Card-Bilder</strong> der Familien werden von der Festplatte gelöscht</span>
                        </div>
                        <div className="flex items-start gap-2 text-red-700">
                            <XCircle size={15} className="shrink-0 mt-0.5" />
                            <span>Alle <strong>Spenden / Inserate</strong> der Spender werden permanent gelöscht</span>
                        </div>
                        <div className="flex items-start gap-2 text-red-700">
                            <XCircle size={15} className="shrink-0 mt-0.5" />
                            <span>Alle <strong>Versandkosten-Erstattungsanträge</strong> inkl. Belege werden gelöscht</span>
                        </div>
                        <div className="border-t border-gray-100 my-2" />
                        <div className="flex items-start gap-2 text-green-700">
                            <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
                            <span>Familien-Profile bleiben erhalten <em>(Name, Adresse, E-Mail)</em></span>
                        </div>
                        <div className="flex items-start gap-2 text-green-700">
                            <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
                            <span>Spender-Profile bleiben erhalten <em>(Name, E-Mail)</em></span>
                        </div>
                    </div>
                </div>

                {/* Status row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5 text-sm">
                    <div className="bg-white rounded-[8px] p-3 border border-gray-100">
                        <p className="text-xs opacity-50 mb-0.5">Letzter Reset</p>
                        <p className="font-bold">{lastResetAt ? formatDate(lastResetAt) : 'Noch nie durchgeführt'}</p>
                    </div>
                    <div className="bg-white rounded-[8px] p-3 border border-gray-100">
                        <p className="text-xs opacity-50 mb-0.5">Nächste Saison ab</p>
                        <p className="font-bold">{nextSeasonFrom ? formatDateOnly(nextSeasonFrom) : '— nicht gesetzt —'}</p>
                    </div>
                </div>

                {/* Next-season date picker */}
                <div className="bg-white rounded-[8px] p-4 border border-gray-100 mb-5">
                    <label className="block text-sm font-bold mb-2 flex items-center gap-2" style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                        <Calendar size={15} /> Nächste Saison ab (Datum)
                    </label>
                    <p className="text-xs opacity-50 mb-3">
                        Ab diesem Datum wird der Reset-Button wieder freigeschaltet. Muss vor dem nächsten Reset gesetzt sein.
                    </p>
                    <div className="flex gap-3 items-center flex-wrap">
                        <input
                            type="date"
                            value={nextSeasonInput}
                            onChange={e => setNextSeasonInput(e.target.value)}
                            className="border border-gray-200 rounded-[6px] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                        />
                        <button
                            onClick={saveNextSeasonDate}
                            disabled={savingDate}
                            className="px-4 py-2 rounded-[6px] text-sm font-bold text-white disabled:opacity-50 flex items-center gap-2 transition-opacity"
                            style={{ backgroundColor: BRAND.greenDark }}
                        >
                            {savingDate ? <Loader2 size={14} className="animate-spin" /> : null}
                            Speichern
                        </button>
                        {dateSaved && (
                            <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                                <CheckCircle2 size={13} /> Gespeichert
                            </span>
                        )}
                    </div>
                </div>

                {/* Reset button or locked state */}
                {isLocked ? (
                    <div className="flex items-center gap-3 p-4 bg-gray-100 rounded-[8px] border border-gray-200">
                        <Lock size={18} className="text-gray-400 shrink-0" />
                        <div>
                            <p className="font-bold text-gray-600 text-sm">Reset gesperrt</p>
                            <p className="text-xs text-gray-500">
                                Bereits zurückgesetzt am {formatDate(lastResetAt)}.
                                {nextSeasonFrom
                                    ? ` Button wird am ${formatDateOnly(nextSeasonFrom)} wieder freigeschaltet.`
                                    : ' Setze das Datum der nächsten Saison, um den Button freizuschalten.'}
                            </p>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={handleOpenConfirm}
                        disabled={phase === 'loading-preview'}
                        className="flex items-center gap-2 px-5 py-3 rounded-[8px] bg-red-600 text-white font-bold text-sm hover:bg-red-700 disabled:opacity-50 transition-all active:scale-95"
                        style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}
                    >
                        {phase === 'loading-preview'
                            ? <><Loader2 size={16} className="animate-spin" /> Lade Vorschau…</>
                            : <><RefreshCw size={16} /> Saison zurücksetzen</>}
                    </button>
                )}

                {/* Phase: done */}
                {phase === 'done' && result && (
                    <div className="mt-4 p-4 bg-green-50 rounded-[8px] border border-green-200">
                        <p className="font-bold text-green-800 flex items-center gap-2 mb-2">
                            <CheckCircle2 size={16} /> Reset erfolgreich durchgeführt
                        </p>
                        <ul className="text-xs text-green-700 space-y-1">
                            <li>Social Cards gelöscht: <strong>{result.socialCardsCleared}</strong> ({result.socialFilesDeleted} Dateien gelöscht{result.socialFilesFailed > 0 ? `, ${result.socialFilesFailed} Fehler` : ''})</li>
                            <li>Spenden gelöscht: <strong>{result.donationsDeleted}</strong> ({result.donationFilesDeleted} Bilder gelöscht{result.donationFilesFailed > 0 ? `, ${result.donationFilesFailed} Fehler` : ''})</li>
                            <li>Durchgeführt am: {formatDate(result.executedAt)}</li>
                        </ul>
                    </div>
                )}

                {/* Phase: error (outside modal) */}
                {phase === 'error' && (
                    <div className="mt-4 p-4 bg-red-100 rounded-[8px] border border-red-200">
                        <p className="font-bold text-red-700 text-sm">Fehler: {errorMsg}</p>
                        <button onClick={() => setPhase('idle')} className="mt-2 text-xs underline text-red-600">
                            Zurück
                        </button>
                    </div>
                )}
            </div>

            {/* ── Modal Backdrop ────────────────────────────────────────── */}
            {(phase === 'confirm-1' || phase === 'confirm-2' || phase === 'running') && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
                    onClick={phase !== 'running' ? handleCancel : undefined}
                >
                    <div
                        className="bg-white rounded-[16px] shadow-2xl max-w-md w-full p-6 md:p-8"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* ── Step 1: Summary ─────────────────────────────── */}
                        {phase === 'confirm-1' && preview && (
                            <>
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                        <AlertTriangle size={20} className="text-red-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg" style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                                            Bist du sicher?
                                        </h4>
                                        <p className="text-xs opacity-50">Diese Aktion kann nicht rückgängig gemacht werden.</p>
                                    </div>
                                </div>

                                {/* Live counts */}
                                <div className="bg-gray-50 rounded-[8px] p-4 border border-gray-200 mb-5 space-y-2 text-sm">
                                    <p className="font-bold text-gray-700 mb-2">Folgendes wird gelöscht:</p>
                                    <div className="flex justify-between items-center">
                                        <span className="flex items-center gap-2 text-red-700"><XCircle size={13} /> Social-Card-Bilder</span>
                                        <span className="font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs">{preview.familiesWithSocialCard}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="flex items-center gap-2 text-red-700"><XCircle size={13} /> Spenden / Inserate</span>
                                        <span className="font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs">{preview.totalDonations}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="flex items-center gap-2 text-red-700"><XCircle size={13} /> Spendenbilder (Dateien)</span>
                                        <span className="font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs">{preview.totalDonationImages}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="flex items-center gap-2 text-red-700"><XCircle size={13} /> Erstattungsbelege (Dateien)</span>
                                        <span className="font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs">{preview.totalReimbursementImages}</span>
                                    </div>
                                </div>

                                <div className="flex gap-3 justify-end">
                                    <button
                                        onClick={handleCancel}
                                        className="px-4 py-2 rounded-[8px] border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                                    >
                                        Abbrechen
                                    </button>
                                    <button
                                        onClick={() => { setConfirmText(''); setPhase('confirm-2'); }}
                                        className="flex items-center gap-2 px-4 py-2 rounded-[8px] bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 transition-colors"
                                    >
                                        Ja, weiter <ChevronRight size={16} />
                                    </button>
                                </div>
                            </>
                        )}

                        {/* ── Step 2: Type to confirm ──────────────────────── */}
                        {phase === 'confirm-2' && (
                            <>
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                                        <Trash2 size={20} className="text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg" style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                                            Letzte Bestätigung
                                        </h4>
                                        <p className="text-xs opacity-50">Keine Möglichkeit zur Rückgängigmachung.</p>
                                    </div>
                                </div>

                                <p className="text-sm mb-2 text-gray-700">
                                    Tippe zur Bestätigung in das Feld:
                                </p>
                                <p className="font-bold text-base mb-3 text-red-700 tracking-wider select-none">
                                    {CONFIRM_PHRASE}
                                </p>

                                <input
                                    type="text"
                                    value={confirmText}
                                    onChange={e => setConfirmText(e.target.value)}
                                    placeholder="Hier tippen…"
                                    autoFocus
                                    className="w-full border-2 rounded-[8px] px-4 py-3 text-sm font-bold mb-5 focus:outline-none transition-colors"
                                    style={{
                                        borderColor: confirmMatches ? BRAND.green : '#E5E7EB',
                                        color: confirmMatches ? BRAND.greenDark : 'inherit',
                                    }}
                                />

                                <div className="flex gap-3 justify-end">
                                    <button
                                        onClick={() => setPhase('confirm-1')}
                                        className="px-4 py-2 rounded-[8px] border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                                    >
                                        Zurück
                                    </button>
                                    <button
                                        onClick={handleConfirm2}
                                        disabled={!confirmMatches}
                                        className="flex items-center gap-2 px-4 py-2 rounded-[8px] bg-red-600 text-white text-sm font-bold hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                    >
                                        <Trash2 size={15} /> Jetzt unwiderruflich löschen
                                    </button>
                                </div>
                            </>
                        )}

                        {/* ── Running ──────────────────────────────────────── */}
                        {phase === 'running' && (
                            <div className="text-center py-10">
                                <Loader2 size={40} className="animate-spin mx-auto mb-4 text-red-500" />
                                <p className="font-bold text-lg" style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                                    Reset läuft…
                                </p>
                                <p className="text-sm opacity-50 mt-1">Bitte Seite nicht schliessen oder neu laden.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
