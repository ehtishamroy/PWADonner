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

// ── Toy categories (per client spec) ──
export const TOY_CATEGORIES = [
    'Buch',
    'Duplo',
    'Lego',
    'Playmobil',
    'Hörspiel',
    'Musik',
    'Plüschtier',
    'Puppen & Zubehör',
] as const;

// ── Age ranges (per client spec) ──
export const AGE_RANGES = [
    '0-1 (Baby)',
    '1-2 Jahre',
    '3-4 Jahre',
    '5-6 Jahre',
    '7-8 Jahre',
    '8+ Jahre',
] as const;

// ── Condition options (per client spec) ──
export const CONDITIONS = ['neu_originalverpackt', 'wie_neu', 'leichte_gebrauchsspuren', 'starke_gebrauchsspuren'] as const;
export const CONDITION_LABELS: Record<string, string> = {
    neu_originalverpackt:     'Neu, originalverpackt',
    wie_neu:                  'Wie neu',
    leichte_gebrauchsspuren:  'Leichte Gebrauchsspuren',
    starke_gebrauchsspuren:   'Starke Gebrauchsspuren',
};
export const CONDITION_COLORS: Record<string, string> = {
    neu_originalverpackt:     BRAND.greenBright,
    wie_neu:                  BRAND.lila,
    leichte_gebrauchsspuren:  BRAND.mustard,
    starke_gebrauchsspuren:   BRAND.redBright,
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
