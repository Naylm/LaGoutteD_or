/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'lgo-bg': '#100D01',
        'lgo-gold-light': '#F4D992',
        'lgo-gold-dark': '#D4A017',
        'lgo-card': '#0F3D33',
        'lgo-border': '#4A1B1F',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      }
    },
  },
  plugins: [],
}
