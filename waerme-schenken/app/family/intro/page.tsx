'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/brand/Logo';
import { Teddy, Gift, Duck } from '@/components/brand/Illustrations';
import { de } from '@/lib/i18n/de';
import { BRAND } from '@/lib/constants';

const steps = [de.familyIntro.step1, de.familyIntro.step2, de.familyIntro.step3];

export default function FamilyIntroPage() {
    const router = useRouter();

    return (
        <div
            className="flex flex-col items-center min-h-screen pt-12 px-8 pb-8 relative md:justify-center overflow-x-hidden"
            style={{ backgroundColor: BRAND.beige }}
        >
            <div className="max-w-4xl w-full">

                {/* Logo + Heading */}
                <div className="text-center mb-10 md:mb-14">
                    <div className="mb-5 flex justify-center">
                        <Logo size={72} animated={false} />
                    </div>
                    <h1
                        style={{
                            fontFamily: "'Bricolage Grotesque', sans-serif",
                            fontWeight: 700, fontSize: '27px', lineHeight: '30px', letterSpacing: '0.01em',
                        }}
                    >
                        {de.intro.heading}
                    </h1>
                </div>

                {/* Steps — 1 column mobile, 3 columns desktop */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 text-center mb-12">
                    {steps.map((s, i) => (
                        <div key={i}>
                            <h2
                                className="font-bold mb-2"
                                style={{
                                    fontFamily: "'Bricolage Grotesque', sans-serif",
                                    fontSize: '20px', lineHeight: '24px', letterSpacing: '0.01em',
                                }}
                            >
                                {s.title}
                            </h2>
                            <p
                                style={{ fontFamily: "'Inter', sans-serif", fontSize: '15px', lineHeight: '20px', color: '#000000' }}
                            >
                                {s.body}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Floating illustrations + CTA */}
                <div className="w-full max-w-sm mx-auto relative mt-2 md:max-w-none">
                    {/* Floating icons — family variant: Teddy left, Gift right, Duck bottom */}
                    <div className="absolute top-[-10px] left-[-30px] md:left-20 drop-shadow-md rotate-[-8deg] z-0">
                        <Teddy width={95} height={95} />
                    </div>
                    <div className="absolute top-[-30px] right-[-20px] md:right-20 drop-shadow-md rotate-[10deg] z-0">
                        <Gift width={90} height={80} />
                    </div>
                    {/* Duck only visible on mobile */}
                    <div className="absolute bottom-[-10px] right-[-30px] drop-shadow-md md:hidden z-0">
                        <Duck width={72} height={63} />
                    </div>

                    {/* CTA buttons — centered */}
                    <div className="flex flex-col items-center gap-3 relative z-20 pt-20">
                        <button
                            onClick={() => router.push('/family/register')}
                            className="h-10 min-w-[143px] px-6 rounded-full text-white shadow-lg active:scale-95 transition-transform flex items-center justify-center"
                            style={{
                                backgroundColor: BRAND.green,
                                fontFamily: "'Bricolage Grotesque', sans-serif",
                                fontWeight: 700, fontSize: '14px', letterSpacing: '0.1em',
                            }}
                        >
                            {de.intro.cta.toUpperCase()}
                        </button>
                        <Link
                            href="/welcome"
                            className="font-bold underline text-sm"
                            style={{ color: BRAND.green, fontFamily: "'Bricolage Grotesque', sans-serif" }}
                        >
                            {de.intro.back}
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
}
