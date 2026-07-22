/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#000000',
          surface: '#0A0A0A',
          elevated: '#111111',
          input: '#1A1A1A',
        },
        lime: {
          DEFAULT: '#CCFF00',
          dim: '#99CC00',
          glow: 'rgba(204,255,0,0.25)',
        },
        cyan: { accent: '#00E5FF' },
        orange: { accent: '#FF6B35' },
        purple: { accent: '#B967FF' },
        surface: { DEFAULT: '#0A0A0A', elevated: '#111111' },
        input: '#1A1A1A',
        txt: {
          primary: '#FFFFFF',
          secondary: '#8A8A8E',
          tertiary: '#5A5A5E',
        },
        success: '#34C759',
        warning: '#FF9500',
        error: '#FF3B30',
        info: '#00E5FF',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
      },
      boxShadow: {
        card: '0 2px 12px rgba(0,0,0,0.4)',
        elevated: '0 8px 32px rgba(0,0,0,0.5)',
        'glow-lime': '0 0 20px rgba(204,255,0,0.3)',
        'glow-lime-strong': '0 0 40px rgba(204,255,0,0.4)',
        'glow-cyan': '0 0 20px rgba(0,229,255,0.25)',
        'inner-glow': 'inset 0 1px 1px rgba(255,255,255,0.06)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        shimmer: 'shimmer 1.5s infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(204,255,0,0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(204,255,0,0.5)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
