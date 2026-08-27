/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#6c2f00",
        "primary-container": "#8b4513",
        "on-primary": "#ffffff",
        "on-primary-container": "#ffc29f",
        "secondary": "#855300",
        "secondary-container": "#fea619",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#684000",
        "surface": "#fcf9f8",
        "surface-container": "#f0eded",
        "surface-container-low": "#f6f3f2",
        "surface-container-high": "#eae7e7",
        "surface-container-lowest": "#ffffff",
        "surface-container-highest": "#e4e2e1",
        "background": "#fffbf5",
        "on-background": "#1b1c1c",
        "on-surface": "#1b1c1c",
        "on-surface-variant": "#54433a",
        "outline": "#877369",
        "outline-variant": "#dac2b6",
        "bakery-amber": "#f59e0b",
        "bakery-gold": "#fea619",
        "bakery-brown": "#8b4513",
        "bakery-cream": "#fffbf5",
        "bakery-sage": "#15803d",
        "bakery-terracotta": "#ba1a1a"
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        headline: ["'Plus Jakarta Sans'", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      borderRadius: {
        "sm": "0.25rem",
        "DEFAULT": "0.5rem",
        "md": "0.75rem",
        "lg": "1rem",
        "xl": "1.5rem",
        "2xl": "2rem",
        "full": "9999px"
      },
      boxShadow: {
        'warm-sm': '0px 2px 8px rgba(139, 69, 19, 0.06)',
        'warm-md': '0px 8px 20px rgba(139, 69, 19, 0.10)',
        'warm-lg': '0px 16px 40px rgba(139, 69, 19, 0.15)',
      }
    },
  },
  plugins: [],
}
