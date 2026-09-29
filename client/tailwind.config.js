/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#030712',
          900: '#070C18',
          850: '#0B1120',
          800: '#0F172A',
          700: '#1E293B',
          600: '#334155',
        },
        cyber: {
          emerald: '#10B981',
          cyan: '#06B6D4',
          indigo: '#6366F1',
          violet: '#8B5CF6',
          amber: '#F59E0B',
          rose: '#F43F5E',
        },
        forest: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          500: '#22C55E',
          700: '#15803D',
          900: '#14532D',
          950: '#052E16',
        },
        amber: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
        },
        paper: {
          bg: '#F8FAFC',
          surface: '#FFFFFF',
          border: '#E2E8F0',
          muted: '#F1F5F9',
        },
        charcoal: {
          500: '#64748B',
          700: '#334155',
          900: '#0F172A',
        },
        warmgray: '#64748B',
        risk: {
          50: '#FFF1F2',
          100: '#FFE4E6',
          500: '#F43F5E',
          700: '#BE123C',
        },
        sage: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          500: '#10B981',
          700: '#047857',
        }
      },
      fontFamily: {
        serif: ['"Fraunces"', '"Source Serif 4"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        display: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        paper: '0 2px 10px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.02)',
        'paper-lg': '0 10px 30px rgba(15, 23, 42, 0.06), 0 4px 8px rgba(15, 23, 42, 0.03)',
        'cinematic-sm': '0 0 15px rgba(16, 185, 129, 0.15)',
        'cinematic': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'cinematic-cyan': '0 0 25px rgba(6, 182, 212, 0.25)',
        'cinematic-emerald': '0 0 25px rgba(16, 185, 129, 0.25)',
        'cinematic-amber': '0 0 25px rgba(245, 158, 11, 0.25)',
        'cinematic-violet': '0 0 30px rgba(139, 92, 246, 0.25)',
        'glass-edge': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.15)',
      },
      backgroundImage: {
        'radial-gradient': 'radial-gradient(circle at 50% 50%, var(--tw-gradient-stops))',
        'aurora-glow': 'radial-gradient(1200px circle at 50% -10%, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.08), transparent 70%)',
        'cyber-grid': 'linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
        'cyber-grid-light': 'linear-gradient(to right, rgba(15, 23, 42, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(15, 23, 42, 0.04) 1px, transparent 1px)',
      },
      animation: {
        'amber-pulse': 'amberPulse 2s infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'radar-sweep': 'radarSweep 3s linear infinite',
        'border-beam': 'borderBeam 4s linear infinite',
        'shimmer': 'shimmer 2.5s ease-in-out infinite',
      },
      keyframes: {
        amberPulse: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(245, 158, 11, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(245, 158, 11, 0)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        radarSweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}
