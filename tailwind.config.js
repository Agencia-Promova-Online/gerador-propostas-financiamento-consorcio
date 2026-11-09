/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0B0B0C',
          900: '#161617',
          800: '#1F1F21',
          700: '#2A2A2D',
          600: '#3F3F46',
          400: '#A1A1AA',
          200: '#D4D4D8',
          50: '#FAFAFA',
        },
        gold: {
          50: '#FBF6E4',
          100: '#F5E9BD',
          200: '#EEDA8F',
          300: '#E6C65C',
          400: '#D9B444',
          500: '#C9A227',
          600: '#B8891A',
          700: '#8F6A14',
          800: '#6B4F10',
          900: '#3F2F0B',
        },
        secondary: {
          50: '#F1F5F9',
          100: '#E2E8F0',
          300: '#94A3B8',
          500: '#64748B',
          700: '#334155',
          900: '#0F172A',
        },
        accent: {
          50: '#FDF4EE',
          100: '#FAE3D2',
          300: '#E9A77A',
          500: '#C97B45',
          700: '#8F4F25',
          900: '#4A2612',
        },
        success: {
          50: '#ECFDF3',
          100: '#D1FADF',
          300: '#6CE9A6',
          500: '#12B76A',
          700: '#027A48',
          900: '#054F31',
        },
        warning: {
          50: '#FFFAEB',
          100: '#FEF0C7',
          300: '#FEC84B',
          500: '#F79009',
          700: '#B54708',
          900: '#7A2E0E',
        },
        error: {
          50: '#FEF3F2',
          100: '#FEE4E2',
          300: '#FDA29B',
          500: '#F04438',
          700: '#B42318',
          900: '#7A271A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      borderRadius: {
        card: '20px',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        sheenMove: {
          '0%': { transform: 'translateX(-120%)' },
          '100%': { transform: 'translateX(120%)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-out both',
        sheen: 'sheenMove 1.2s ease-in-out',
      },
    },
  },
  plugins: [],
};
