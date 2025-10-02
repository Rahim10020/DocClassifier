import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

const config: Config = {
    darkMode: ['class', '[data-mode="dark"]'],
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
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
            },
            typography: {
                DEFAULT: {
                    css: {
                        fontFamily: 'Geist, Inter, sans-serif',
                    },
                },
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
        animate,
        function ({ addUtilities }) {
            addUtilities({
                '.glass': {
                    'background-color': 'rgba(255, 255, 255, 0.1)',
                    'backdrop-filter': 'blur(10px)',
                    'border': '1px solid rgba(255, 255, 255, 0.18)',
                },
                '.glass-card': {
                    'background-color': 'rgba(30, 41, 59, 0.8)', // slate-800 with opacity
                    'backdrop-filter': 'blur(12px)',
                    'border': '1px solid rgba(255, 255, 255, 0.1)',
                    'box-shadow': '0 4px 30px rgba(0, 0, 0, 0.1)',
                },
            });
        },
    ],
};

export default config;