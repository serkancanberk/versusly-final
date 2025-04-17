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
        'hero': '48px',
        'heading': '32px',
        'subheading': '24px',
        'body': '16px',
        'label': '14px',
        'caption': '13px',
        'ui-number': '20px',
      },
      lineHeight: {
        'hero': '110%',
        'heading': '120%',
        'subheading': '130%',
        'body': '150%',
        'label': '140%',
        'caption': '130%',
        'ui-number': '110%',
      },
      fontWeight: {
        bold: '700',
        medium: '500',
        regular: '400',
      },
      // Buton stilleri burada
      spacing: {
        'btn-padding-x': '1rem', // px-6
        'btn-padding-y': '0.5rem', // py-2
        'btn-radius': '0.375rem', // rounded-md
      },
      // Button types
      buttonStyle: {
        'btnC2A': {
          backgroundColor: '#F7FF00', // primary
          color: '#191716', // secondary
          padding: '0.5rem 1rem',
          borderRadius: '0.375rem', // rounded-md
          fontSize: '16px',
          fontWeight: 'bold',
          transition: 'background-color 0.3s ease, opacity 0.3s ease',
        },
        'btnTag': {
          backgroundColor: '#E0E2DB', // muted
          color: '#191716', // secondary
          padding: '0.25rem 0.75rem',
          borderRadius: '0.375rem', // rounded-md
          fontSize: '14px',
          fontWeight: 'medium',
        },
        'btnSimple': {
          backgroundColor: '#FFFFFF', // bgwhite
          color: '#191716', // secondary
          padding: '0.5rem 1.5rem',
          borderRadius: '0.375rem', // rounded-md
          fontSize: '16px',
          fontWeight: 'regular',
          border: '1px solid #E0E2DB', // muted border
        },
      },
    },
  },
  plugins: [],
}
