import { BRAND } from '@/lib/constants';

// ── Helicopter (mustard/yellow) ─────────────────────────────────────────────
export function Helicopter({ width = 100, height = 80 }: { width?: number; height?: number }) {
    return (
        <svg width={width} height={height} viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Body */}
            <path d="M20 50C20 40 30 35 50 35C70 35 80 40 80 50C80 65 65 70 50 70C35 70 20 65 20 50Z"
                fill={BRAND.mustard} stroke="#000" strokeWidth="2.5" />
            {/* Rotor mast */}
            <path d="M50 35V25" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
            {/* Rotor blades */}
            <path d="M30 25H70" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
            {/* Tail */}
            <path d="M80 50L92 44M80 50L92 56" stroke="#000" strokeWidth="2" strokeLinecap="round" />
            {/* Window */}
            <circle cx="45" cy="50" r="8" fill="white" stroke="#000" strokeWidth="2" />
            <circle cx="45" cy="50" r="4" fill={BRAND.mustard} opacity="0.4" />
        </svg>
    );
}

// ── Teddy Bear (lila/purple) ────────────────────────────────────────────────
export function Teddy({ width = 100, height = 100 }: { width?: number; height?: number }) {
    return (
        <svg width={width} height={height} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Ears */}
            <circle cx="28" cy="28" r="13" fill={BRAND.lila} stroke="#000" strokeWidth="2.5" />
            <circle cx="72" cy="28" r="13" fill={BRAND.lila} stroke="#000" strokeWidth="2.5" />
            {/* Inner ears */}
            <circle cx="28" cy="28" r="7" fill={BRAND.lila} stroke="#000" strokeWidth="1.5" opacity="0.6" />
            <circle cx="72" cy="28" r="7" fill={BRAND.lila} stroke="#000" strokeWidth="1.5" opacity="0.6" />
            {/* Body */}
            <path d="M20 55C20 38 80 38 80 55C80 78 20 78 20 55Z" fill={BRAND.lila} stroke="#000" strokeWidth="2.5" />
            {/* Head */}
            <circle cx="50" cy="48" r="20" fill={BRAND.lila} stroke="#000" strokeWidth="2.5" />
            {/* Face */}
            <circle cx="43" cy="44" r="2.5" fill="#000" />
            <circle cx="57" cy="44" r="2.5" fill="#000" />
            <path d="M44 53 Q50 58 56 53" stroke="#000" strokeWidth="2" strokeLinecap="round" fill="none" />
            {/* Belly */}
            <ellipse cx="50" cy="64" rx="12" ry="8" fill="white" stroke="#000" strokeWidth="1.5" opacity="0.5" />
        </svg>
    );
}

// ── Gift Box (green bright) ─────────────────────────────────────────────────
export function Gift({ width = 100, height = 90 }: { width?: number; height?: number }) {
    return (
        <svg width={width} height={height} viewBox="0 0 100 90" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Box */}
            <rect x="15" y="35" width="70" height="45" rx="4" fill={BRAND.greenBright} stroke="#000" strokeWidth="2.5" />
            {/* Ribbon vertical */}
            <path d="M50 35V80" stroke="#000" strokeWidth="2.5" />
            {/* Ribbon horizontal */}
            <path d="M15 55H85" stroke="#000" strokeWidth="2.5" />
            {/* Bow left */}
            <path d="M50 35C50 35 38 18 22 18C12 18 12 30 22 30C34 30 50 35 50 35Z"
                stroke="#000" strokeWidth="2.5" fill={BRAND.greenBright} />
            {/* Bow right */}
            <path d="M50 35C50 35 62 18 78 18C88 18 88 30 78 30C66 30 50 35 50 35Z"
                stroke="#000" strokeWidth="2.5" fill={BRAND.greenBright} />
        </svg>
    );
}

// ── Rubber Duck (mustard) ───────────────────────────────────────────────────
export function Duck({ width = 80, height = 70 }: { width?: number; height?: number }) {
    return (
        <svg width={width} height={height} viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Body */}
            <path d="M18 45C18 33 32 22 55 22C78 22 92 38 92 55C92 66 76 72 55 72C32 72 18 62 18 45Z"
                fill={BRAND.mustard} stroke="#000" strokeWidth="2.5" />
            {/* Head/neck */}
            <path d="M55 22V13C55 8 65 4 74 9" stroke="#000" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <circle cx="68" cy="8" r="10" fill={BRAND.mustard} stroke="#000" strokeWidth="2.5" />
            {/* Beak */}
            <path d="M76 6L86 8L76 10Z" fill={BRAND.mustard} stroke="#000" strokeWidth="1.8" />
            {/* Eye */}
            <circle cx="72" cy="5" r="2.5" fill="#000" />
            <circle cx="73" cy="4" r="0.8" fill="white" />
            {/* Wing */}
            <path d="M35 50 Q50 40 65 50" stroke="#000" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.4" />
        </svg>
    );
}

// ── Toy Car (outline) ───────────────────────────────────────────────────────
export function Car({ width = 120, height = 80 }: { width?: number; height?: number }) {
    return (
        <svg width={width} height={height} viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Body */}
            <path d="M10 55H110V42C110 32 100 22 78 22H42C22 22 10 32 10 42V55Z"
                fill="white" stroke="#000" strokeWidth="2.5" />
            {/* Roof */}
            <path d="M35 38L42 22H78L85 38H35Z" fill="white" stroke="#000" strokeWidth="2" />
            {/* Windows */}
            <rect x="40" y="26" width="16" height="12" rx="2" fill="#D6EEF8" stroke="#000" strokeWidth="1.5" />
            <rect x="62" y="26" width="16" height="12" rx="2" fill="#D6EEF8" stroke="#000" strokeWidth="1.5" />
            {/* Wheels */}
            <circle cx="32" cy="60" r="10" fill="white" stroke="#000" strokeWidth="2.5" />
            <circle cx="32" cy="60" r="4"  fill="#E5E7EB" />
            <circle cx="88" cy="60" r="10" fill="white" stroke="#000" strokeWidth="2.5" />
            <circle cx="88" cy="60" r="4"  fill="#E5E7EB" />
        </svg>
    );
}

// ── Zebra Cat sticker (lila) — used in dashboard NEWS ──────────────────────
export function ZebraCat({ width = 70, height = 70 }: { width?: number; height?: number }) {
    return (
        <svg width={width} height={height} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-sm">
            {/* Body arch */}
            <path d="M15 75 C15 50 35 32 58 32 C82 32 92 50 92 72"
                fill={BRAND.lila} stroke="#000" strokeWidth="2.5" />
            {/* Tail */}
            <path d="M15 75 Q5 90 18 88 Q28 86 25 75" fill={BRAND.lila} stroke="#000" strokeWidth="2" />
            {/* Left ear */}
            <path d="M30 45 L18 18 L46 38 Z" fill={BRAND.lila} stroke="#000" strokeWidth="2.5" />
            {/* Right ear */}
            <path d="M62 34 L58 12 L80 34 Z" fill={BRAND.lila} stroke="#000" strokeWidth="2.5" />
            {/* Eyes */}
            <circle cx="42" cy="52" r="3.5" fill="#000" />
            <circle cx="43.5" cy="51" r="1" fill="white" />
            <circle cx="68" cy="52" r="3.5" fill="#000" />
            <circle cx="69.5" cy="51" r="1" fill="white" />
            {/* Nose */}
            <ellipse cx="55" cy="60" rx="3" ry="2" fill="#000" opacity="0.5" />
            {/* Whiskers left */}
            <path d="M20 58 L38 60" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M20 63 L38 63" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
            {/* Whiskers right */}
            <path d="M72 60 L90 58" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M72 63 L90 63" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
            {/* Stripes */}
            <path d="M42 70 Q50 65 58 70" stroke="#000" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
        </svg>
    );
}
