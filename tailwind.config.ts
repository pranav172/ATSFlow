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
        // Modern Purple/Violet Theme
        primary: {
          DEFAULT: '#8b5cf6', // Violet 500
          hover: '#7c3aed',   // Violet 600
          light: '#ede9fe',   // Violet 100
          dark: '#6d28d9',    // Violet 700
        },
        // Status Colors (Dark Mode Optimized)
        success: '#10b981',   // Emerald 500
        warning: '#f59e0b',   // Amber 500
        danger: '#ef4444',    // Red 500
        info: '#06b6d4',      // Cyan 500
        
        // Light Mode
        background: '#ffffff',
        surface: '#f8fafc',   // Slate 50
        border: '#e2e8f0',    // Slate 200
        
        // Text Colors (Light Mode)
        text: {
          primary: '#0f172a',    // Slate 900
          secondary: '#64748b',  // Slate 500
          muted: '#94a3b8',      // Slate 400
        },
        
        // Dark Mode Colors
        dark: {
          background: '#0a0a0f', // Deep Dark Navy
          surface: '#1a1a24',    // Dark Surface
          surfaceHover: '#252530', // Hover state
          border: '#2d2d3d',     // Subtle border
          text: {
            primary: '#f1f5f9',    // Slate 100
            secondary: '#cbd5e1',  // Slate 300
            muted: '#94a3b8',      // Slate 400
          },
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
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};

export default config;
