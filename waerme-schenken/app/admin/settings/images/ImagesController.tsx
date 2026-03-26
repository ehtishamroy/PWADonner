'use client';

import { useState, useEffect } from 'react';
import { BRAND } from '@/lib/constants';
import { Upload, CheckCircle } from 'lucide-react';
import Image from 'next/image';

const ASSETS = [
    { id: 'logo', name: 'Hauptlogo (HeartHug)', expectedType: 'image/png', path: '/images/logo.png', format: 'PNG (Transparent)' },
    { id: 'ill-helicopter', name: 'Illustration: Helikopter', expectedType: 'image/png', path: '/images/helicopter.png', format: 'PNG (Transparent)' },
    { id: 'ill-teddy', name: 'Illustration: Teddy', expectedType: 'image/png', path: '/images/teddy.png', format: 'PNG (Transparent)' },
    { id: 'ill-gift', name: 'Illustration: Geschenk', expectedType: 'image/png', path: '/images/gift.png', format: 'PNG (Transparent)' },
    { id: 'ill-duck', name: 'Illustration: Ente', expectedType: 'image/png', path: '/images/duck.png', format: 'PNG (Transparent)' },
    { id: 'ill-car', name: 'Illustration: Auto', expectedType: 'image/png', path: '/images/car.png', format: 'PNG (Transparent)' },
    { id: 'ill-zebracat', name: 'Illustration: Zebra-Katze', expectedType: 'image/png', path: '/images/zebracat.png', format: 'PNG (Transparent)' },
    { id: 'split-photo', name: 'Startbild (Split-Screen)', expectedType: 'image/jpeg', path: '/images/split-photo.jpg', format: 'JPG / Hochformat' },
    { id: 'favicon', name: 'Browser Favicon', expectedType: 'image/png', path: '/favicon.png', format: 'PNG Datei' },
    { id: 'icon192', name: 'App Icon (192px)', expectedType: 'image/png', path: '/icons/icon-192x192.png', format: 'PNG / 192x192' },
    { id: 'icon512', name: 'App Icon (512px)', expectedType: 'image/png', path: '/icons/icon-512x512.png', format: 'PNG / 512x512' },
    { id: 'apple-icon', name: 'Apple Touch Icon', expectedType: 'image/png', path: '/icons/apple-touch-icon.png', format: 'PNG / 180x180' },
];

export default function ImagesController() {
    const [uploading, setUploading] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState('');
    const [timestamp, setTimestamp] = useState<number | null>(null);

    // Verhindert den Hydration Error, da Date.now() auf dem Server und Client unterschiedlich wäre
    useEffect(() => {
        setTimestamp(Date.now());
    }, []);

    async function handleUpload(e: React.ChangeEvent<HTMLInputElement>, id: string) {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        
        setUploading(id);
        setSuccessMsg('');

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('typeId', id);

            const res = await fetch('/api/admin/settings/upload-image', {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                setSuccessMsg('Bild erfolgreich aktualisiert! (Drücke Strg+F5 um es zu sehen)');
                setTimeout(() => window.location.reload(), 2000);
            } else {
                alert('Fehler beim Hochladen.');
            }
        } catch {
            alert('Netzwerkfehler');
        } finally {
            setUploading(null);
        }
    }

    return (
        <div className="space-y-6">
            {successMsg && (
                <div className="p-4 bg-green-50 text-green-800 rounded-xl mb-6 flex items-center gap-3 font-medium text-sm">
                    <CheckCircle size={18} />
                    {successMsg}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ASSETS.map((asset) => (
                    <div key={asset.id} className="border border-gray-100 rounded-[20px] p-5 flex flex-col items-center text-center bg-gray-50/50">
                        <div className="w-24 h-24 mb-4 bg-white rounded-[16px] shadow-sm relative overflow-hidden flex items-center justify-center border border-gray-100">
                            {asset.id !== 'favicon' ? (
                                <Image src={`${asset.path}${timestamp ? `?v=${timestamp}` : ''}`} alt="" fill className="object-contain p-2" unoptimized />
                            ) : (
                                <img src={`${asset.path}${timestamp ? `?v=${timestamp}` : ''}`} alt="favicon" className="w-8 h-8" />
                            )}
                        </div>
                        
                        <h4 className="font-bold mb-1" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                            {asset.name}
                        </h4>
                        <p className="text-xs opacity-50 mb-5 font-mono bg-black/5 px-2 py-1 rounded">
                            {asset.format}
                        </p>

                        <label className={`mt-auto px-5 py-2.5 rounded-full text-white text-[11px] font-bold uppercase tracking-widest cursor-pointer transition-transform active:scale-95 flex items-center gap-2 ${uploading === asset.id ? 'opacity-50 pointer-events-none' : ''}`} style={{ backgroundColor: BRAND.green }}>
                            {uploading === asset.id ? 'Lädt hoch...' : (
                                <>
                                    <Upload size={14} />
                                    Austauschen
                                </>
                            )}
                            <input 
                                type="file" 
                                hidden 
                                accept={asset.expectedType}
                                onChange={(e) => handleUpload(e, asset.id)}
                            />
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );
}
