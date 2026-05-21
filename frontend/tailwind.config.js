/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        boba: {
          50: "#fdf8f6",
          100: "#f9ede8",
          200: "#f2d5c9",
          300: "#e8b4a0",
          400: "#d9896f",
          500: "#c96b4f",
          600: "#b85542",
          700: "#994538",
          800: "#7d3a32",
          900: "#67332c",
        },
        taro: {
          400: "#b8a9c9",
          500: "#9b8ab5",
          600: "#7d6a9a",
        },
        matcha: {
          400: "#8fbc8f",
          500: "#6b9e6b",
        },
      },
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
        display: ["Outfit", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        pulseSoft: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
        },
      },
      boxShadow: {
        card: "0 4px 24px -4px rgba(0,0,0,0.08), 0 2px 8px -2px rgba(0,0,0,0.04)",
        "card-dark": "0 4px 24px -4px rgba(0,0,0,0.4)",
      },
    },
  },
  plugins: [],
};
