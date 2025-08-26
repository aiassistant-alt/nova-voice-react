/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'rotate-gradient': 'rotate-gradient 3s linear infinite',
        'wave': 'wave 2s ease-in-out infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s infinite',
        'colorchange': 'colorchange 3s linear infinite',
      },
      keyframes: {
        'rotate-gradient': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        },
        'wave': {
          '0%': {
            opacity: '1',
            transform: 'translate(-50%,-50%) scale(1)'
          },
          '100%': {
            opacity: '0',
            transform: 'translate(-50%,-50%) scale(1.5)'
          }
        },
        'shimmer': {
          '0%': { left: '-100%' },
          '100%': { left: '100%' }
        },
        'colorchange': {
          'to': { filter: 'hue-rotate(360deg)' }
        }
      }
    },
  },
  plugins: [],
}