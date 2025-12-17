/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Kid-friendly color tokens
                primary: {
                    DEFAULT: '#3B82F6', // Friendly blue
                    foreground: '#ffffff',
                    50: '#EFF6FF',
                    100: '#DBEAFE',
                    500: '#3B82F6',
                    600: '#2563EB',
                    700: '#1D4ED8',
                },
                accent: {
                    DEFAULT: '#14B8A6', // Teal
                    foreground: '#ffffff',
                    50: '#F0FDFA',
                    100: '#CCFBF1',
                    500: '#14B8A6',
                    600: '#0D9488',
                },
                kidAccent: {
                    DEFAULT: '#FACC15', // Sun yellow
                    foreground: '#000000',
                    50: '#FEFCE8',
                    100: '#FEF9C3',
                    500: '#FACC15',
                    600: '#EAB308',
                },
                danger: {
                    DEFAULT: '#EF4444', // Soft red
                    foreground: '#ffffff',
                    50: '#FEF2F2',
                    100: '#FEE2E2',
                    500: '#EF4444',
                    600: '#DC2626',
                },
                secondary: {
                    DEFAULT: '#10B981',
                    foreground: '#ffffff',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
            },
            fontSize: {
                'xs': ['0.75rem', { lineHeight: '1.5' }],
                'sm': ['0.875rem', { lineHeight: '1.5' }],
                'base': ['1rem', { lineHeight: '1.6' }],
                'lg': ['1.125rem', { lineHeight: '1.6' }],
                'xl': ['1.25rem', { lineHeight: '1.6' }],
                '2xl': ['1.5rem', { lineHeight: '1.5' }],
                '3xl': ['1.875rem', { lineHeight: '1.4' }],
                '4xl': ['2.25rem', { lineHeight: '1.3' }],
                '5xl': ['3rem', { lineHeight: '1.2' }],
            },
            borderRadius: {
                'xl': '1rem',
                '2xl': '1.25rem',
                '3xl': '1.5rem',
                'kid': '1.5rem', // Large rounded corners for kid-friendly UI
            },
            spacing: {
                'kid': '1rem', // Larger spacing for touch targets
                'kid-lg': '1.5rem',
                'kid-xl': '2rem',
            },
            boxShadow: {
                'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
                'glow': '0 0 20px rgba(59, 130, 246, 0.3)',
                'glow-green': '0 0 20px rgba(16, 185, 129, 0.3)',
                'glow-yellow': '0 0 20px rgba(250, 204, 21, 0.3)',
            },
            animation: {
                'bounce-gentle': 'bounce-gentle 2s ease-in-out infinite',
                'shake': 'shake 0.5s ease-in-out',
                'fade-in': 'fade-in 0.5s ease-in',
                'scale-in': 'scale-in 0.3s ease-out',
                'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
            },
            keyframes: {
                'bounce-gentle': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                'shake': {
                    '0%, 100%': { transform: 'translateX(0)' },
                    '25%': { transform: 'translateX(-5px)' },
                    '75%': { transform: 'translateX(5px)' },
                },
                'fade-in': {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                'scale-in': {
                    '0%': { transform: 'scale(0.9)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                'glow-pulse': {
                    '0%, 100%': { opacity: '0.5', boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)' },
                    '50%': { opacity: '1', boxShadow: '0 0 30px rgba(59, 130, 246, 0.5)' },
                },
            },
        },
    },
    plugins: [],
}


