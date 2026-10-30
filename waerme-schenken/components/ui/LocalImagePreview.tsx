'use client';

import { useState } from 'react';
import { ImageOff } from 'lucide-react';

// Preview of a photo the user just picked (blob: URL). Browsers other than
// Safari cannot display HEIC (iPhone) photos, so show a neutral placeholder
// instead of a broken image — the server converts the photo on upload.
export function LocalImagePreview({ src, className = '' }: { src: string; className?: string }) {
    const [failed, setFailed] = useState(false);

    if (failed) {
        return (
            <div className={`w-full h-full flex flex-col items-center justify-center bg-gray-100 text-center p-1 ${className}`}>
                <ImageOff size={20} className="opacity-40" />
                <span className="text-[10px] leading-tight opacity-50 mt-1">Foto ausgewählt</span>
            </div>
        );
    }

    return <img src={src} alt="" className={`w-full h-full object-cover ${className}`} onError={() => setFailed(true)} />;
}
