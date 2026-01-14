/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0FBA0F",
      },
      fontFamily: {
        tinos: ["Lora", "serif"],
      },
    },
  },
  plugins: [],
};
