export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft':       '0 30px 80px rgba(15, 23, 42, 0.12)',
        'soft-dark':  '0 30px 80px rgba(0, 0, 0, 0.35)',
        'glow-cyan':  '0 0 40px rgba(6, 182, 212, 0.25)',
        'glow-indigo':'0 0 40px rgba(99, 102, 241, 0.25)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
