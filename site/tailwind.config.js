/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                'bg-primary': '#0a0f1c',
                'bg-secondary': '#111827',
                'bg-card': '#1a2332',
                'accent': '#FF8C42',
                'accent-light': '#FFAD60',
                'success': '#4ADE80',
                'danger': '#F87171',
                'warning': '#FBBF24',
                'border': '#5D4E37',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            animation: {
                'wiggle': 'wiggle 1s ease-in-out infinite',
                'float-slow': 'float-slow 6s ease-in-out infinite',
                'float-medium': 'float-medium 4s ease-in-out infinite',
                'bounce-slow': 'bounce-slow 2s ease-in-out infinite',
            },
            keyframes: {
                wiggle: {
                    '0%, 100%': { transform: 'rotate(-3deg)' },
                    '50%': { transform: 'rotate(3deg)' },
                },
                'float-slow': {
                    '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
                    '50%': { transform: 'translateY(-20px) rotate(10deg)' },
                },
                'float-medium': {
                    '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
                    '50%': { transform: 'translateY(-15px) rotate(-5deg)' },
                },
                'bounce-slow': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-5px)' },
                },
            },
        },
    },
    plugins: [],
};
