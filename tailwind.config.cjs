/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Professional Blue Theme
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Professional Gray Theme
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        // Consistent Background Colors
        background: {
          primary: '#f9fafb',    // bg-gray-50 - main page background
          secondary: '#ffffff',   // bg-white - card/container background
          tertiary: '#f3f4f6',   // bg-gray-100 - subtle background
        },
        // Consistent Text Colors
        text: {
          primary: '#111827',     // text-gray-900 - primary text
          secondary: '#4b5563',   // text-gray-600 - secondary text
          tertiary: '#6b7280',    // text-gray-500 - muted text
          inverse: '#ffffff',     // text-white - text on dark backgrounds
        },
        // Consistent Border Colors
        border: {
          primary: '#d1d5db',     // border-gray-300 - default borders
          secondary: '#e5e7eb',   // border-gray-200 - subtle borders
          focus: '#3b82f6',       // border-blue-500 - focus states
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Consistent Typography Scale
        'heading-xl': ['1.875rem', { lineHeight: '2.25rem', fontWeight: '600' }], // text-3xl font-semibold
        'heading-lg': ['1.5rem', { lineHeight: '2rem', fontWeight: '600' }],      // text-2xl font-semibold
        'heading-md': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600' }],  // text-xl font-semibold
        'heading-sm': ['1.125rem', { lineHeight: '1.5rem', fontWeight: '500' }],  // text-lg font-medium
        'body-lg': ['1rem', { lineHeight: '1.5rem', fontWeight: '400' }],         // text-base
        'body-md': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }],    // text-sm
        'body-sm': ['0.75rem', { lineHeight: '1rem', fontWeight: '400' }],        // text-xs
      },
      spacing: {
        // Consistent Spacing Scale
        'container': '1rem',      // Standard container padding
        'section': '1.5rem',      // Section spacing
        'component': '1rem',      // Component internal spacing
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
} 