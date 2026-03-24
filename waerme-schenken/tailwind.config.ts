import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    green:       '#537D61',
                    greenDark:   '#335E52',
                    greenBright: '#9DBDA7',
                    beige:       '#F5F0EA',
                    mustard:     '#E8B870',
                    lila:        '#A8ADED',
                    redBright:   '#F1997D',
                    error:       '#DE0000',
                    font:        '#000000',
                },
            },
            fontFamily: {
                heading: ['"Bricolage Grotesque"', 'sans-serif'],
                body:    ['"Inter"', 'sans-serif'],
                sans:    ['"Inter"', 'sans-serif'],
            },
            fontSize: {
                'h1':     ['27px', { lineHeight: '30px', letterSpacing: '0.01em', fontWeight: '700' }],
                'h2':     ['20px', { lineHeight: '24px', letterSpacing: '0.01em', fontWeight: '700' }],
                'h3caps': ['20px', { lineHeight: '20px', letterSpacing: '0.04em', fontWeight: '500' }],
                'h4':     ['16px', { lineHeight: '20px', letterSpacing: '0.01em', fontWeight: '700' }],
                'body1':  ['15px', { lineHeight: '20px', letterSpacing: '0' }],
                'body2':  ['13px', { lineHeight: '16px', letterSpacing: '0.01em' }],
                'btn':    ['14px', { letterSpacing: '0.1em', fontWeight: '700' }],
                'nav':    ['12px', { lineHeight: '14px', letterSpacing: '0.01em' }],
            },
            borderRadius: {
                'xl2': '32px',
                'xl3': '40px',
                'xl4': '48px',
            },
            keyframes: {
                heartbeat: {
                    '0%, 100%': { transform: 'scale(1)' },
                    '50%':      { transform: 'scale(1.06)' },
                },
                fadeIn: {
                    '0%':   { opacity: '0', transform: 'translateY(8px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
            animation: {
                heartbeat: 'heartbeat 2s ease-in-out infinite',
                fadeIn:    'fadeIn 0.4s ease-out',
            },
        },
    },
    plugins: [],
};

export default config;
