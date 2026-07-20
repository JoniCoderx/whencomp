import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Deep tactical charcoals
        ink: {
          950: "#08090b",
          900: "#0b0d10",
          850: "#0f1216",
          800: "#14181e",
          700: "#1c212a",
          600: "#262c38",
          500: "#333a48",
        },
        // Primary brand accent — CS amber/gold
        brand: {
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
        },
        steel: {
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        brand: "0 0 0 1px rgba(245,158,11,0.25), 0 8px 30px rgba(245,158,11,0.12)",
        "glow-amber": "0 0 24px rgba(245,158,11,0.35)",
        card: "0 10px 40px rgba(0,0,0,0.45)",
      },
      backgroundImage: {
        "brand-sheen":
          "radial-gradient(circle at 15% 0%, rgba(245,158,11,0.10), transparent 45%), radial-gradient(circle at 85% 10%, rgba(56,189,248,0.06), transparent 45%)",
      },
      keyframes: {
        "pulse-soft": {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
        rise: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "pulse-soft": "pulse-soft 2.2s ease-in-out infinite",
        rise: "rise 0.5s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
