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
      fontSize: {
        'hero': '48px', // text-hero
        'heading': '32px', // text-heading
        'subheading': '24px', // text-subheading
        'body': '16px', // text-body
        'label': '14px', // text-label
        'caption': '13px', // text-caption
        'ui-number': '20px', // text-ui-number
      },
      lineHeight: {
        'hero': '110%',
        'heading': '120%',
        'subheading': '130%', // text-subheading
        'body': '150%', // text-body
        'label': '140%', // text-label
        'caption': '130%', // text-caption
        'ui-number': '110%', // text-ui-number
      },
      fontWeight: {
        bold: '700', // For bold text
        medium: '500', // For medium weight text
        regular: '400', // For regular weight text
      }
    },
  },
  plugins: [],
}
