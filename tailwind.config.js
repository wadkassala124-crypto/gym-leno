/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gym: {
          950: '#080808',
          900: '#111111',
          850: '#161616',
          800: '#1f1f1f',
          700: '#2a2a2a',
          600: '#3a3a3a',
          500: '#555555',
          accent: 'rgb(var(--gym-accent-rgb, 204 255 0) / <alpha-value>)',
          'accent-hover': 'rgb(var(--gym-accent-hover-rgb, 184 230 0) / <alpha-value>)',
          'accent-contrast': 'var(--gym-accent-contrast, #000000)',
          orange: '#ff5e14',
          lime: 'rgb(var(--gym-accent-rgb, 204 255 0) / <alpha-value>)',
          'lime-light': 'rgb(var(--gym-accent-hover-rgb, 184 230 0) / <alpha-value>)',
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-oswald)', 'Impact', 'sans-serif'],
        arabic: ['Cairo', 'Segoe UI', 'Tahoma', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
