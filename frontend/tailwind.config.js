/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', '"Inter"', 'sans-serif'],
        mono: ['"Space Mono"', 'monospace'],
      },
      colors: {
        brand: {
          50: '#fef2f0',
          100: '#fde3de',
          200: '#fbc4b9',
          300: '#f69d8a',
          400: '#d96b55',
          500: '#C8553D',
          600: '#b34832',
          700: '#963c2a',
          800: '#7a3223',
          900: '#652b1f',
          950: '#3a150e',
        },
        accent: {
          400: '#4a8a6e',
          500: '#2D4A3E',
          600: '#243d33',
        },
        surface: {
          50: '#F5F0E8',   /* warm parchment — main bg */
          100: '#EDE6DA',  /* slightly darker parchment */
          200: '#E8D5B7',  /* warm sand — cards, inputs */
          300: '#DCC9A5',  /* deeper sand */
          700: '#5C5347',  /* muted brown */
          800: '#3D362F',  /* dark warm */
          900: '#2B2118',  /* dark walnut — text */
          950: '#1A140D',  /* deepest ink */
        },
        forest: {
          500: '#2D4A3E',
          600: '#243D33',
          700: '#1B3028',
        },
        status: {
          green: '#5A8A6E',
          amber: '#D4A843',
          red: '#C85555',
          blue: '#5A7A9E',
        },
      },
      backgroundImage: {
        'grain': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease forwards',
        'fade-in': 'fadeIn 0.4s ease forwards',
        'slide-in': 'slideIn 0.3s ease forwards',
        shimmer: 'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: 0, transform: 'translateY(20px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        slideIn: {
          from: { opacity: 0, transform: 'translateX(-10px)' },
          to: { opacity: 1, transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      borderColor: {
        DEFAULT: 'rgba(43, 33, 24, 0.12)',
      },
    },
  },
  plugins: [],
};
