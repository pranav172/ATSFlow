import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Brand Colors
        primary: {
          DEFAULT: '#6366f1', // Indigo 500
          hover: '#4f46e5',   // Indigo 600
          light: '#e0e7ff',   // Indigo 100
        },
        // Status Colors
        success: '#10b981',   // Emerald 500
        warning: '#f59e0b',   // Amber 500
        danger: '#ef4444',    // Red 500
        info: '#3b82f6',      // Blue 500
        // Background & Surface
        background: '#ffffff',
        surface: '#f8fafc',   // Slate 50
        border: '#e2e8f0',    // Slate 200
        // Text Colors
        text: {
          primary: '#0f172a',    // Slate 900
          secondary: '#64748b',  // Slate 500
          muted: '#94a3b8',      // Slate 400
        },
        // Dark Mode
        dark: {
          background: '#0f172a', // Slate 900
          surface: '#1e293b',    // Slate 800
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
      },
      fontSize: {
        xs: '12px',
        sm: '14px',
        base: '16px',
        lg: '18px',
        xl: '24px',
        '2xl': '30px',
        '3xl': '36px',
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'skeleton': 'skeleton 2s ease-in-out infinite',
      },
      keyframes: {
        skeleton: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
      },
      transitionDuration: {
        '150': '150ms',
        '300': '300ms',
      },
      transitionTimingFunction: {
        'button': 'ease-out',
        'modal': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
