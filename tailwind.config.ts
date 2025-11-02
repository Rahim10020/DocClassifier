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
                    hover: '#4f46e5',
                    light: '#eef2ff',
                },
                background: {
                    DEFAULT: '#fafbfc',
                    secondary: '#f4f6f8',
                    tertiary: '#e9ecef',
                    elevated: '#ffffff',
                },
                foreground: {
                    DEFAULT: '#1a202c',
                    muted: '#718096',
                },
                success: {
                    DEFAULT: '#10b981',
                    light: '#d1fae5',
                },
                warning: {
                    DEFAULT: '#f59e0b',
                    light: '#fef3c7',
                },
                error: {
                    DEFAULT: '#ef4444',
                    light: '#fee2e2',
                },
                border: {
                    DEFAULT: '#e2e8f0',
                    hover: '#cbd5e1',
                },
            },
            fontFamily: {
                sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
            },
            boxShadow: {
                'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                'sm': '0 2px 4px 0 rgba(0, 0, 0, 0.06), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
                'DEFAULT': '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
                'md': '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
                'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
                'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.02)',
                '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
            },
            borderRadius: {
                'xl': '1rem',
                '2xl': '1.5rem',
            },
            backdropBlur: {
                'xs': '2px',
            },
            animation: {
                'fade-in': 'fadeIn 0.4s ease-out',
                'slide-in': 'slideIn 0.3s ease-out',
                'scale-in': 'scaleIn 0.3s ease-out',
            },
        },
    },
    plugins: [
        require('tailwindcss-animate'),
    ],
};

export default config;