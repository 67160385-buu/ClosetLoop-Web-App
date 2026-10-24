/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#151515",
        paper: "#f7f6f2",
        cream: "#eee9df",
        muted: "#77746f",
        accent: "#c7b99b",
        soft: "#f0eee9",
      },
      fontFamily: {
        sans: ["Montserrat", "Prompt", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        serif: ['"Playfair Display"', 'serif'],
      },
    },
  },
  plugins: [],
}
