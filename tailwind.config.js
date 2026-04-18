/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand colors (Masterball-inspired)
        purple: {
          600: '#9333EA',    // Interactive elements, hover states
          700: '#7C3AED',    // Primary brand color
        },
        magenta: {
          600: '#C026D3',    // CTA buttons, highlights
          700: '#A21CAF',    // Hover states for magenta buttons
        },
        pink: {
          600: '#DB2777',    // Accent elements, badges
        },

        // Background colors
        background: '#FAFBFC',      // Main app background (off-white)
        surface: '#FFFFFF',         // Cards, elevated surfaces
        'surface-secondary': '#F7F5F9',  // Secondary surfaces with purple tint

        // Text colors
        text: {
          primary: '#111827',       // Primary body text (gray-900)
          secondary: '#6B7280',     // Secondary text (gray-500)
          tertiary: '#9CA3AF',      // Disabled/placeholder text (gray-400)
          'on-dark': '#F9FAFB',     // Text on colored backgrounds
        },

        // Semantic colors
        success: '#10B981',         // emerald-500
        warning: '#F59E0B',         // amber-500
        error: '#EF4444',           // red-500

        // Border colors
        border: {
          DEFAULT: '#E5E7EB',       // gray-200 - default borders
          hover: '#D1D5DB',         // gray-300 - hover state
        },

        // Dark mode colors
        dark: {
          background: '#0F172A',    // slate-900
          surface: '#1E293B',       // slate-800
          border: '#334155',        // slate-700
        },
      },
      backgroundImage: {
        'purple-gradient': 'linear-gradient(135deg, #7C3AED 0%, #C026D3 100%)',
        'purple-gradient-soft': 'linear-gradient(135deg, #F7F5F9 0%, #FAFBFC 100%)',
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.06)',
        'card-hover':
          '0 10px 30px -10px rgba(124, 58, 237, 0.25), 0 4px 12px rgba(15, 23, 42, 0.06)',
      },
      transitionTimingFunction: {
        snappy: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.6s infinite',
      },
    },
  },
  plugins: [],
}
