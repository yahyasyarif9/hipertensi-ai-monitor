/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0F2A2D',
        paper: '#F8FAFB',
        line: '#E2E8F0',
        muted: '#64748B',
        brand: { 
          DEFAULT: '#0D8E7F', 
          dark: '#0A7166', 
          darker: '#085A51',
          soft: '#E0F5F2',
          light: '#B8EDE7'
        },
        alarm: { DEFAULT: '#DC2626', soft: '#FEE2E2' },
        success: { DEFAULT: '#16A34A', soft: '#DCFCE7' },
        warning: { DEFAULT: '#F59E0B', soft: '#FEF3C7' },
      },
      fontFamily: {
        display: ['"Inter"', 'system-ui', 'sans-serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.05)',
        'card': '0 1px 3px rgba(0, 0, 0, 0.08)',
        'hover': '0 4px 12px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
};
