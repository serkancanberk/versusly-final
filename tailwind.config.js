/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#F7FF00",
        secondary: "#191716",
        accent: "#FB8000",
        mutedDark: "#BEB7A4",
        muted: "#E0E2DB",
        muted25: "#F7F8F6",
        alert: "#D23001",
        bgwhite: "#FFFFFF",
        bgashwhite: "#FCFCFC",
      },
      fontFamily: {
        sans: ["'IBM Plex Sans'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
    },
  },
  plugins: [],
}
