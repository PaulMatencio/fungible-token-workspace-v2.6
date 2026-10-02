import type { Config } from 'tailwindcss';

/** Midnight theme tokens: deep-navy surfaces with an indigo→violet accent. */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        midnight: {
          950: '#070812',
          900: '#0b0d1c',
          850: '#10132a',
          800: '#151936',
          700: '#1e2347',
          600: '#2a3060',
          500: '#3b4380'
        },
        accent: { DEFAULT: '#7c83ff', soft: '#a5aaff', strong: '#5a62f0' },
        ok: '#3ddc97',
        warn: '#ffc857',
        bad: '#ff6b81'
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', 'Inter', 'Segoe UI', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace']
      },
      boxShadow: { glow: '0 0 0 1px rgba(124,131,255,.25), 0 8px 30px -12px rgba(90,98,240,.45)' }
    }
  },
  plugins: []
};
export default config;
