/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Bricolage Grotesque', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        serif: ['Spectral', 'serif'],
      },
      colors: {
        cloud: '#38bdf8',
        fullstack: '#f97316',
        data: '#a78bfa',
        ai: '#f43f5e',
        cyber: '#10b981',
        design: '#fbbf24',
        networking: '#6366f1',
        business: '#34d399',
      },
    },
  },
  plugins: [],
}
