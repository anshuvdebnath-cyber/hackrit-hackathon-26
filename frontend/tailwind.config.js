/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Fraunces', 'serif'],
        sans: ['Nunito', 'sans-serif'],
      },
      colors: {
        moss: {
          50: '#f4f7f2',
          100: '#e5eee1',
          200: '#cbdcc4',
          300: '#a6c29b',
          400: '#7fa472',
          500: '#5d7052', // PRD Low Risk color
          600: '#47573e',
          700: '#384432',
          800: '#2e3729',
          900: '#272f23',
        },
        terracotta: {
          50: '#fbf7f3',
          100: '#f5ebe1',
          200: '#ebd4bf',
          300: '#deb898',
          400: '#d09b6f',
          500: '#c18c5d', // PRD Moderate Risk color
          600: '#a56f43',
          700: '#855435',
          800: '#6e442f',
          900: '#5c3929',
        },
        clay: {
          50: '#fbf4f3',
          100: '#f7e6e4',
          200: '#f0cfca',
          300: '#e3afa7',
          400: '#d1867b',
          500: '#a85448', // PRD High Risk color
          600: '#944237',
          700: '#7b352b',
          800: '#662f27',
          900: '#562a24',
        },
        earth: {
          50: '#faf8f5',
          100: '#f3efe9',
          200: '#e7e0d3',
          300: '#d6cbb8',
          400: '#c2b098',
          500: '#aa967c',
          600: '#957f66',
          700: '#7c6853',
          800: '#665546',
          900: '#26221c',
          950: '#14120f',
        }
      }
    },
  },
  plugins: [],
}

