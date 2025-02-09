/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#139A43', // Green
          light: '#B6F2D1',   // Light green
        },
        secondary: {
          DEFAULT: '#29339B', // Blue
          light: '#85D1DB',   // Light blue
        },
        accent: '#B3EBF2',    // Lightest blue
      },
    },
  },
  plugins: [],
} 