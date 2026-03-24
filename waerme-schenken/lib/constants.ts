// ── Brand colors (mirrored from tailwind.config for use in inline SVG/styles) ──
export const BRAND = {
    green:       '#537D61',
    greenDark:   '#335E52',
    greenBright: '#9DBDA7',
    beige:       '#F5F0EA',
    white:       '#FFFFFF',
    font:        '#000000',
    mustard:     '#E8B870',
    lila:        '#A8ADED',
    redBright:   '#F1997D',
    error:       '#DE0000',
} as const;

// ── Toy categories ──
export const TOY_CATEGORIES = [
    'Bücher',
    'Holzspielzeug',
    'Lego',
    'Plüschtiere',
    'Fahrzeuge',
    'Gesellschaftsspiele',
    'Puzzles',
    'Outdoor',
    'Sonstiges',
] as const;

// ── Age ranges ──
export const AGE_RANGES = [
    '0-1',
    '1-3',
    '3-6',
    '6-9',
    '9-12',
    '12+',
] as const;

// ── Condition options ──
export const CONDITIONS = ['neu', 'wie_neu', 'gebraucht'] as const;
export const CONDITION_LABELS: Record<string, string> = {
    neu:        'Neu',
    wie_neu:    'Wie neu',
    gebraucht:  'Gebraucht',
};
export const CONDITION_COLORS: Record<string, string> = {
    neu:       BRAND.greenBright,
    wie_neu:   BRAND.lila,
    gebraucht: BRAND.mustard,
};

// ── Donation status ──
export const STATUS_COLORS: Record<string, string> = {
    waiting:  '#D1D5DB',
    approved: BRAND.mustard,
    selected: BRAND.lila,
    sent:     BRAND.greenBright,
    rejected: BRAND.redBright,
};

export const STATUS_LABELS: Record<string, string> = {
    waiting:  'Warten',
    approved: 'Freigegeben',
    selected: 'Ausgewählt',
    sent:     'Gesendet',
    rejected: 'Abgelehnt',
};

// ── Session config ──
export const SESSION_DURATION_DAYS = 30;
export const OTP_EXPIRY_MINUTES    = 10;
export const OTP_RATE_LIMIT        = 3; // max OTP requests per hour
