/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#5C5666', // Green
          light: '#BFAFD0',   // 
        },
        secondary: {
          DEFAULT: '#B3EBF2', // Non Photo Blue
          light: '#EFD3D7 ',   // Misty Rose
        },
        accent: '#FEEAFA',    // Pale Purple Pinks
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
} 