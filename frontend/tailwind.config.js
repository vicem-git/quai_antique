/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'ground-0': 'oklch(0.9215 0.022 92.52)',
        'ground-1': 'oklch(0.800 0.022 92.52)',
        'ground-2': 'oklch(0.600 0.022 92.52)',
        'ground-3': 'oklch(0.450 0.022 92.52)',
        'primary-0': 'oklch(0.642 0.022 32.08)',
        'primary-1': 'oklch(0.552 0.022 32.08)',
        'primary-2': 'oklch(0.45 0.022 32.08)',
        'primary-3': 'oklch(0.3042 0.022 32.08)',
        'secondary-0': 'oklch(0.642 0.0014 197.08)',
        'accent': '#E07856',
        'accent-hover': '#D0694A',
        'hours': '#C9B8A3',
      },
      fontFamily: {
        'cormorant': ['"Cormorant Upright"', 'serif'],
        'montserrat': ['Montserrat', 'sans-serif'],
        'playwrite': ['"Playwrite US Trad"', 'cursive'],
      },
    },
  },
  plugins: [],
}
