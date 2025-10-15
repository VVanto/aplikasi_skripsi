/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        olive: "#3C3D37",
        darkOlive: "#181C14",
        lightOlive: "#5c5e54",
        cream: "#ECDFCC",
        sage: "#005956",
      },
    },
  },
  plugins: [],
};
