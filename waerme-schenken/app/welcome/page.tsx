'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Logo } from '@/components/brand/Logo';
import { Helicopter, Teddy } from '@/components/brand/Illustrations';
import { de } from '@/lib/i18n/de';
import { BRAND } from '@/lib/constants';

export default function WelcomePage() {
    const router = useRouter();

    function goToDonor() {
        router.push('/donor/intro');
    }

    return (
        <div
            className="flex flex-col items-center min-h-screen pt-12 px-8 pb-8 md:justify-center"
            style={{ backgroundColor: BRAND.beige }}
        >
            <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

                {/* ── LEFT COLUMN ── */}
                <div className="text-center md:text-left order-1">
                    {/* Logo — left-aligned on desktop, centered on mobile */}
                    <div className="mb-6 hidden md:block">
                        <Logo size={90} animated={false} />
                    </div>
                    <div className="mb-6 md:hidden flex justify-center">
                        <Logo size={72} animated={false} />
                    </div>

                    {/* Heading */}
                    <h1
                        className="mb-4"
                        style={{
                            fontFamily:    "'Bricolage Grotesque', sans-serif",
                            fontWeight:    700,
                            fontSize:      '27px',
                            lineHeight:    '30px',
                            letterSpacing: '0.01em',
                        }}
                    >
                        {de.split.heading}
                    </h1>

                    {/* Body */}
                    <p
                        className="opacity-80 mb-8 max-w-md mx-auto md:mx-0"
                        style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize:   '15px',
                            lineHeight: '20px',
                        }}
                    >
                        {de.split.body}
                    </p>

                    {/* Desktop role buttons — side by side */}
                    <div className="hidden md:flex gap-4">
                        <button
                            onClick={goToDonor}
                            className="px-12 py-4 rounded-full text-white font-bold uppercase tracking-widest text-sm transition-transform active:scale-95 hover:opacity-90"
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
                            className="px-12 py-4 rounded-full font-bold uppercase tracking-widest text-sm transition-transform active:scale-95 hover:opacity-90 border-2"
                            style={{
                                backgroundColor: BRAND.white,
                                color:            BRAND.green,
                                borderColor:      BRAND.green,
                                fontFamily:       "'Bricolage Grotesque', sans-serif",
                                letterSpacing:    '0.1em',
                            }}
                        >
                            {de.split.donor.toUpperCase()}
                        </button>
                    </div>

                    {/* Desktop login link */}
                    <p className="hidden md:block mt-6 text-sm opacity-50">
                        Bereits Konto?{' '}
                        <Link href="/donor/login" className="underline font-bold" style={{ color: BRAND.green }}>
                            Jetzt einloggen
                        </Link>
                    </p>
                </div>

                {/* ── RIGHT COLUMN — Photo with floating SVGs ── */}
                <div className="relative w-full aspect-[4/5] rounded-3xl overflow-visible order-2">
                    {/* Photo / placeholder */}
                    <div
                        className="w-full h-full rounded-3xl overflow-hidden shadow-lg flex items-center justify-center"
                        style={{ backgroundColor: BRAND.greenBright + '66' }}
                    >
                        {/* ── Replace this block with a real <Image> when you have the photo ──
                            <Image src="/images/split-photo.jpg" alt="Kind mit Spielzeug" fill className="object-cover" priority />
                        */}
                        <Logo size={160} animated={false} />
                    </div>

                    {/* Floating Helicopter — top left */}
                    <div className="absolute top-[-28px] left-[-30px] drop-shadow-lg z-10">
                        <Helicopter width={105} height={84} />
                    </div>

                    {/* Floating Teddy — bottom right */}
                    <div className="absolute bottom-[-18px] right-[-18px] drop-shadow-lg z-10">
                        <Teddy width={95} height={95} />
                    </div>
                </div>

                {/* ── MOBILE-ONLY role buttons — full width below photo ── */}
                <div className="w-full grid grid-cols-2 gap-4 md:hidden order-3">
                    <button
                        onClick={goToDonor}
                        className="py-4 rounded-full text-white font-bold uppercase tracking-widest text-sm transition-transform active:scale-95"
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
                        className="py-4 rounded-full font-bold uppercase tracking-widest text-sm transition-transform active:scale-95 border-2"
                        style={{
                            backgroundColor: BRAND.white,
                            color:            BRAND.green,
                            borderColor:      BRAND.green,
                            fontFamily:       "'Bricolage Grotesque', sans-serif",
                            letterSpacing:    '0.1em',
                        }}
                    >
                        {de.split.donor.toUpperCase()}
                    </button>
                </div>
            </div>
        </div>
    );
}
