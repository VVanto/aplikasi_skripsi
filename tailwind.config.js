/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        fadeIn: "fadeIn 0.3s ease-out forwards",
        waves: "waves 6s infinite linear",
        wavesAlt: "waves 7s infinite linear",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        waves: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      colors: {
        olive: "#3C3D37",
        darkOlive: "#181C14",
        lightOlive: "#5c5e54",
        cream: "#ECDFCC",
        sage: "#005956",
        red: "#C5172E",
        green: "#93DA97",
        blue: "#1e3a8a",
        maroon: "#7B542F",
        darkGreen: "#556B2F"
      },
    },
  },
  plugins: [],
};