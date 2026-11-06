/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2D3B2D', // Deep forest sage
          light: '#445644',
          dark: '#1E281E',
          subtle: '#F0F3EF',
        },
        accent: {
          DEFAULT: '#C2A97E', // Warm champagne sand
          light: '#D8C6A5',
          dark: '#9E845A',
          subtle: '#FAF7F2',
        },
        background: '#F7F5F0', // Warm ivory ground
        surface: {
          DEFAULT: '#FFFFFF',
          warm: '#FAF8F5',
          ivory: '#F4EFEA',
        },
        'text-primary': '#222622', // Deep charcoal
        'text-secondary': '#636B61', // Earthy slate
        border: {
          DEFAULT: '#E6E1D8', // Warm sand border
          light: '#EFECE6',
          dark: '#D0C9BD',
        },
        sand: {
          50: '#FAF8F5',
          100: '#F4EFEA',
          200: '#E8DEC8',
          300: '#D9C6A5',
          400: '#C2A97E',
          500: '#A88F65',
          600: '#8A734D',
        },
        sage: {
          50: '#F4F6F3',
          100: '#E6EAE4',
          200: '#CED6CA',
          300: '#A8B5A2',
          400: '#7E8E77',
          500: '#596B52',
          600: '#445640',
          700: '#364533',
          800: '#283426',
          900: '#1C241B',
        },
        success: '#366A46',
        error: '#A83232',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 10px rgba(34, 38, 34, 0.04), 0 1px 3px rgba(34, 38, 34, 0.02)',
        'card-hover': '0 12px 28px rgba(34, 38, 34, 0.08), 0 3px 8px rgba(34, 38, 34, 0.04)',
        nav: '0 1px 4px rgba(34, 38, 34, 0.05)',
        modal: '0 24px 48px rgba(34, 38, 34, 0.16)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        'modal-in': 'modalIn 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        modalIn: {
          '0%': { opacity: '0', transform: 'scale(0.97) translateY(4px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
