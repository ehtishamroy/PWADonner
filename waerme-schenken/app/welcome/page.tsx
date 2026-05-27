'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Logo } from '@/components/brand/Logo';
import { Helicopter, Teddy } from '@/components/brand/Illustrations';
import { de } from '@/lib/i18n/de';
import { BRAND } from '@/lib/constants';

export default function WelcomePage() {
    const router = useRouter();
    const [timestamp, setTimestamp] = useState<number | null>(null);

    useEffect(() => {
        setTimestamp(Date.now());
    }, []);

    function goToFamily() {
        router.push('/family/intro');
    }

    function goToDonor() {
        router.push('/donor/intro');
    }

    return (
        <>
            {/* ── MOBILE LAYOUT ── fits within one viewport height ── */}
            <div
                className="md:hidden flex flex-col min-h-[100dvh] pt-12 px-8 pb-8"
                style={{ backgroundColor: BRAND.beige }}
            >
                {/* Logo */}
                <div className="flex justify-center mb-5">
                    <Logo size={72} animated={false} />
                </div>

                {/* Heading */}
                <h1
                    className="text-center mb-2"
                    style={{
                        fontFamily: "'Bricolage Grotesque', sans-serif",
                        fontWeight: 700,
                        fontSize: '27px',
                        lineHeight: '30px',
                        letterSpacing: '0.01em',
                    }}
                >
                    {de.split.heading}
                </h1>

                {/* Body */}
                <p
                    className="text-center opacity-80 mb-0 max-w-xs mx-auto"
                    style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '15px',
                        lineHeight: '20px',
                    }}
                >
                    {de.split.body}
                </p>

                {/* Photo + Buttons — pinned to bottom as a group */}
                <div className="mt-auto pt-14">
                <div className="relative w-full overflow-visible mb-8" style={{ height: '48vh', minHeight: '320px' }}>
                    <div className="w-full h-full overflow-hidden shadow-lg relative bg-gray-100">
                        <Image
                            src={`/images/split-photo.jpg${timestamp ? `?v=${timestamp}` : ''}`}
                            alt="Kind mit Spielzeug"
                            fill
                            className="object-cover"
                            priority
                            unoptimized
                        />
                    </div>

                    {/* Floating Helicopter — top left */}
                    <div className="absolute drop-shadow-lg z-10" style={{ top: -42, left: 14, transform: 'rotate(0deg)' }}>
                        <Helicopter width={119} height={90} />
                    </div>

                    {/* Floating Teddy — bottom right */}
                    <div className="absolute drop-shadow-lg z-10" style={{ bottom: -20, right: 10, transform: 'rotate(17.96deg)' }}>
                        <Teddy width={106} height={134} />
                    </div>
                </div>

                {/* Role buttons */}
                <div className="grid grid-cols-2 gap-3 shrink-0">
                    <button
                        onClick={goToFamily}
                        className="h-10 rounded-full text-white font-bold uppercase tracking-widest text-[13px] transition-transform active:scale-95 flex items-center justify-center"
                        style={{
                            backgroundColor: BRAND.green,
                            fontFamily:       "'Bricolage Grotesque', sans-serif",
                            letterSpacing:    '0.1em',
                        }}
                    >
                        {de.split.family.toUpperCase()}
                    </button>
                    <button
                        onClick={goToDonor}
                        className="h-10 rounded-full font-bold uppercase tracking-widest text-[13px] transition-transform active:scale-95 flex items-center justify-center"
                        style={{
                            backgroundColor: BRAND.white,
                            color:            BRAND.green,
                            fontFamily:       "'Bricolage Grotesque', sans-serif",
                            letterSpacing:    '0.1em',
                        }}
                    >
                        {de.split.donor.toUpperCase()}
                    </button>
                </div>
                </div>{/* end bottom group */}
            </div>

            {/* ── DESKTOP LAYOUT ── unchanged two-column ── */}
            <div
                className="hidden md:flex flex-col items-center min-h-screen px-8 pb-8 justify-center"
                style={{ backgroundColor: BRAND.beige }}
            >
                <div className="max-w-4xl w-full grid grid-cols-2 gap-12 items-center">
                    {/* Left column */}
                    <div className="text-left">
                        <div className="mb-6">
                            <Logo size={90} animated={false} />
                        </div>

                        <h1
                            className="mb-4"
                            style={{
                                fontFamily: "'Bricolage Grotesque', sans-serif",
                                fontWeight: 700,
                                fontSize: '27px',
                                lineHeight: '30px',
                                letterSpacing: '0.01em',
                            }}
                        >
                            {de.split.heading}
                        </h1>

                        <p
                            className="opacity-80 mb-8 max-w-md"
                            style={{
                                fontFamily: "'Inter', sans-serif",
                                fontSize: '15px',
                                lineHeight: '20px',
                            }}
                        >
                            {de.split.body}
                        </p>

                        <div className="flex gap-4">
                            <button
                                onClick={goToFamily}
                                className="h-10 min-w-[143px] px-6 rounded-full text-white font-bold uppercase tracking-widest text-[13px] transition-transform active:scale-95 hover:opacity-90 flex items-center justify-center"
                                style={{
                                    backgroundColor: BRAND.green,
                                    fontFamily:       "'Bricolage Grotesque', sans-serif",
                                    letterSpacing:    '0.1em',
                                }}
                            >
                                {de.split.family.toUpperCase()}
                            </button>
                            <button
                                onClick={goToDonor}
                                className="h-10 min-w-[143px] px-6 rounded-full font-bold uppercase tracking-widest text-[13px] transition-transform active:scale-95 hover:opacity-90 flex items-center justify-center"
                                style={{
                                    backgroundColor: BRAND.white,
                                    color:            BRAND.green,
                                    fontFamily:       "'Bricolage Grotesque', sans-serif",
                                    letterSpacing:    '0.1em',
                                }}
                            >
                                {de.split.donor.toUpperCase()}
                            </button>
                        </div>

                        <p className="mt-6 text-sm opacity-50">
                            Bereits Konto?{' '}
                            <Link href="/donor/login" className="underline font-bold" style={{ color: BRAND.green }}>
                                Jetzt einloggen
                            </Link>
                        </p>
                    </div>

                    {/* Right column — Photo */}
                    <div className="relative w-full aspect-[4/5] overflow-visible">
                        <div className="w-full h-full overflow-hidden shadow-lg flex items-center justify-center relative bg-gray-100">
                            <Image
                                src={`/images/split-photo.jpg${timestamp ? `?v=${timestamp}` : ''}`}
                                alt="Kind mit Spielzeug"
                                fill
                                className="object-cover"
                                priority
                                unoptimized
                            />
                        </div>
                        <div className="absolute top-[-28px] left-[-30px] drop-shadow-lg z-10">
                            <Helicopter width={105} height={84} />
                        </div>
                        <div className="absolute bottom-[-18px] right-[-18px] drop-shadow-lg z-10">
                            <Teddy width={95} height={95} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
