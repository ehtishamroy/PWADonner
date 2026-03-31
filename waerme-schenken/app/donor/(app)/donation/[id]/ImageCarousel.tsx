'use client';

import { useState } from 'react';

export function ImageCarousel({ images, altBase }: { images: { imageUrl: string }[], altBase: string }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!images || images.length === 0) return null;

    return (
        <div className="w-full h-full relative group">
            {/* Main Image */}
            <div className="w-full h-full relative transition-opacity duration-300">
                <img
                    src={images[currentIndex].imageUrl}
                    alt={`${altBase} Foto ${currentIndex + 1}`}
                    className="w-full h-full object-cover absolute inset-0 transition-transform duration-300"
                />
            </div>

            {/* Navigation Arrows */}
            {images.length > 1 && (
                <>
                    <button
                        onClick={(e) => { e.preventDefault(); setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev)); }}
                        disabled={currentIndex === 0}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center text-black/70 shadow-sm disabled:opacity-30 disabled:cursor-not-allowed transition-opacity z-20"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    </button>
                    <button
                        onClick={(e) => { e.preventDefault(); setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : prev)); }}
                        disabled={currentIndex === images.length - 1}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center text-black/70 shadow-sm disabled:opacity-30 disabled:cursor-not-allowed transition-opacity z-20"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                    </button>
                </>
            )}

            {/* Dots */}
            {images.length > 1 && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
                    {images.map((_, i) => (
                        <button
                            key={i}
                            onClick={(e) => { e.preventDefault(); setCurrentIndex(i); }}
                            className={`w-2 h-2 rounded-full transition-colors ${i === currentIndex ? 'bg-white' : 'bg-white/40'}`}
                        />
                    ))}
                </div>
            )}
            
            {/* Counter badge (optional style overlay) */}
            {images.length > 1 && (
                <div className="absolute top-4 right-4 bg-black/50 text-white text-[10px] font-bold px-2 py-1 rounded-md z-20">
                    {currentIndex + 1} / {images.length}
                </div>
            )}
        </div>
    );
}
