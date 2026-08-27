'use client';

import { useState } from 'react';
import { BRAND } from '@/lib/constants';

export function PasswordChangeForm() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword]         = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [saving, setSaving] = useState(false);
    const [saved,  setSaved]  = useState(false);
    const [error,  setError]  = useState('');

    async function submit() {
        setError('');
        if (newPassword.length < 8) { setError('Neues Passwort muss mindestens 8 Zeichen haben.'); return; }
        if (newPassword !== confirmPassword) { setError('Passwörter stimmen nicht überein.'); return; }
        if (newPassword === currentPassword) { setError('Neues Passwort muss sich vom aktuellen unterscheiden.'); return; }

        setSaving(true); setSaved(false);
        try {
            const res = await fetch('/api/admin/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || 'Fehler'); return; }
            setSaved(true);
            setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
            setTimeout(() => setSaved(false), 2500);
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="space-y-4">
            <div>
                <label className="block mb-2 text-xs font-bold uppercase tracking-widest opacity-50"
                    style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>Aktuelles Passwort</label>
                <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                    className="w-full border-2 border-gray-100 rounded-[8px] p-3 text-[15px] outline-none focus:border-gray-300" />
            </div>
            <div>
                <label className="block mb-2 text-xs font-bold uppercase tracking-widest opacity-50"
                    style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>Neues Passwort</label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                    className="w-full border-2 border-gray-100 rounded-[8px] p-3 text-[15px] outline-none focus:border-gray-300" />
            </div>
            <div>
                <label className="block mb-2 text-xs font-bold uppercase tracking-widest opacity-50"
                    style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>Neues Passwort bestätigen</label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full border-2 border-gray-100 rounded-[8px] p-3 text-[15px] outline-none focus:border-gray-300" />
            </div>
            {error && <p className="text-[13px]" style={{ color: BRAND.error }}>{error}</p>}
            <div className="flex gap-3 items-center">
                <button onClick={submit} disabled={saving}
                    className="h-10 px-6 rounded-full text-white shadow-sm active:scale-95 disabled:opacity-40"
                    style={{ backgroundColor: BRAND.green, fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: '13px', letterSpacing: '0.1em' }}>
                    {saving ? 'SPEICHERN...' : 'SPEICHERN'}
                </button>
                {saved && <span className="text-sm" style={{ color: BRAND.green }}>Gespeichert ✓</span>}
            </div>
        </div>
    );
}
