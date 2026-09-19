/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1240px" },
    },
    extend: {
      colors: {
        // Deep forest / almost-black green backgrounds
        canvas: {
          DEFAULT: "#060B09",
          raised: "#0A130F",
          deep: "#040706",
        },
        forest: {
          900: "#07110D",
          800: "#0C1D16",
          700: "#123026",
          600: "#17402F",
        },
        sage: {
          DEFAULT: "#A9C4A5",
          soft: "#C3D8BF",
          dim: "#7C9479",
        },
        emerald: {
          muted: "#3E8E6E",
          deep: "#2A6B51",
        },
        cream: {
          DEFAULT: "#F1EEE4",
          dim: "#B9C2B8",
          faint: "#7E8B82",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
      },
      borderRadius: {
        card: "22px",
        field: "14px",
      },
      boxShadow: {
        glass:
          "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 24px 60px -30px rgba(0,0,0,0.85)",
        lift: "0 30px 70px -40px rgba(62,142,110,0.55)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(14px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        drift: {
          "0%, 100%": { transform: "translate3d(0,0,0) rotate(0deg)" },
          "50%": { transform: "translate3d(0,-26px,0) rotate(6deg)" },
        },
        "ring-fill": {
          from: { strokeDashoffset: "var(--ring-circumference)" },
          to: { strokeDashoffset: "var(--ring-offset-target)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fade-in 0.6s ease-out both",
        drift: "drift 18s ease-in-out infinite",
        "ring-fill": "ring-fill 1.1s cubic-bezier(0.22, 1, 0.36, 1) forwards",
      },
    },
  },
  plugins: [],
};
