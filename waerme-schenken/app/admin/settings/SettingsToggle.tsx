'use client';

import { useState } from 'react';
import { BRAND } from '@/lib/constants';

export function SettingsToggle({ initial }: { initial: boolean }) {
    const [on, setOn] = useState(initial);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    async function toggle() {
        const next = !on;
        setOn(next);
        setSaving(true); setSaved(false);
        try {
            const res = await fetch('/api/admin/app-settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ familyApprovalRequired: next }),
            });
            if (!res.ok) { setOn(!next); return; }
            setSaved(true);
            setTimeout(() => setSaved(false), 1500);
        } finally { setSaving(false); }
    }

    return (
        <div className="flex items-center gap-4">
            <button onClick={toggle} disabled={saving}
                className="relative w-14 h-8 rounded-full transition-colors"
                style={{ backgroundColor: on ? BRAND.green : '#D1D5DB' }}
                aria-pressed={on}>
                <span className="absolute top-1 w-6 h-6 bg-white rounded-full transition-transform shadow-md"
                    style={{ left: on ? 'calc(100% - 28px)' : '4px' }} />
            </button>
            <span className="text-sm font-bold" style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                {on ? 'Aktiviert' : 'Deaktiviert'}
            </span>
            {saved && <span className="text-xs" style={{ color: BRAND.green }}>Gespeichert ✓</span>}
        </div>
    );
}
