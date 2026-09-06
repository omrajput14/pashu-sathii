/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nav: {
          bg: 'var(--color-nav-bg)',
          text: 'var(--color-nav-text)',
          active: 'var(--color-nav-text-active)',
          border: 'var(--color-nav-border)',
          hover: 'var(--color-nav-hover)',
        },
        workspace: 'var(--color-workspace-bg)',
        surface: {
          DEFAULT: 'var(--color-surface)',
          hover: 'var(--color-surface-hover)',
          active: 'var(--color-surface-active)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          strong: 'var(--color-border-strong)',
        },
        primary: {
          DEFAULT: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          hover: 'var(--color-accent-hover)',
          subtle: 'var(--color-accent-subtle)',
        },
        risk: {
          critical: 'var(--color-risk-critical)',
          'critical-bg': 'var(--color-risk-critical-bg)',
          high: 'var(--color-risk-high)',
          'high-bg': 'var(--color-risk-high-bg)',
          medium: 'var(--color-risk-medium)',
          'medium-bg': 'var(--color-risk-medium-bg)',
          low: 'var(--color-risk-low)',
          'low-bg': 'var(--color-risk-low-bg)',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'IBM Plex Mono', 'monospace'],
      },
      borderRadius: {
        sm: '2px',
        DEFAULT: '4px',
        md: '4px',
        lg: '6px',
      },
      boxShadow: {
        subtle: '0 1px 2px rgba(16, 24, 38, 0.04)',
      },
    },
  },
  plugins: [],
};
