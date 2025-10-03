import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    darkMode: ['class', '[data-mode="dark"]'],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#6366f1',
                    gradient: '#8b5cf6',
                },
                background: {
                    dark: '#0f172a',
                    secondary: '#1e293b',
                },
                muted: {
                    foreground: '#475569',
                },
                accent: '#818cf8',
                destructive: '#ef4444',
                border: '#334155',
                input: '#1e293b',
                ring: '#6366f1',
            },
            fontFamily: {
                sans: ['Geist', 'Inter', 'sans-serif'],
            },
            spacing: {
                'generous': '2rem',
            },
            borderRadius: {
                subtle: '0.25rem',
            },
            boxShadow: {
                pronounced: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-in-out',
                'slide-in': 'slideIn 0.3s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideIn: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
            },
        },
    },
    plugins: [
        require('tailwindcss-animate'),
    ],
};

export default config;