import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep gamer blacks/grays
        base: {
          950: "#050507",
          900: "#0a0a0a",
          850: "#0f0f12",
          800: "#141419",
          700: "#1c1c24",
          600: "#26262f",
          500: "#33333f",
        },
        // Vibrant neon accents
        neon: {
          blue: "#3b82f6",
          electric: "#22d3ee",
          purple: "#a855f7",
          violet: "#8b5cf6",
          pink: "#ec4899",
          lime: "#a3e635",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "neon-blue": "0 0 20px rgba(59,130,246,0.45), 0 0 40px rgba(59,130,246,0.15)",
        "neon-purple": "0 0 20px rgba(168,85,247,0.45), 0 0 40px rgba(168,85,247,0.15)",
        "neon-cyan": "0 0 20px rgba(34,211,238,0.45), 0 0 40px rgba(34,211,238,0.15)",
        "glow-soft": "0 8px 40px rgba(0,0,0,0.5)",
      },
      backgroundImage: {
        "grid-glow":
          "radial-gradient(circle at 20% 20%, rgba(59,130,246,0.12), transparent 40%), radial-gradient(circle at 80% 0%, rgba(168,85,247,0.12), transparent 40%)",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "pulse-glow": "pulse-glow 2.4s ease-in-out infinite",
        float: "float 4s ease-in-out infinite",
        shimmer: "shimmer 2s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
