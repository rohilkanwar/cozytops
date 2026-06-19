import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Heritage atelier palette — the colours of a crest:
        // ivory ground, deep navy ink, claret, forest, antique brass.
        cream: "#F6F1E6", // warm ivory ground
        parchment: "#FBF8F0", // card surface
        oat: "#E7DCC6", // bone / sand
        ink: {
          DEFAULT: "#1C2A37", // deep navy-charcoal (primary text)
          soft: "#43505C",
        },
        navy: {
          DEFAULT: "#16293F",
          deep: "#0F1E30",
          soft: "#33506E",
        },
        burgundy: {
          DEFAULT: "#6E2A33", // claret accent / primary action
          soft: "#8A3A43",
          deep: "#511E26",
        },
        forest: {
          DEFAULT: "#2F4A3B",
          soft: "#445E4C",
          deep: "#213729",
        },
        brass: {
          DEFAULT: "#A98B4E", // antique gold hairlines
          soft: "#C4A86B",
          deep: "#856A38",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Cormorant Garamond", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        cozy: "3px",
      },
      letterSpacing: {
        luxe: "0.22em",
        crest: "0.32em",
      },
      boxShadow: {
        cozy: "0 30px 64px -36px rgba(16, 28, 45, 0.42)",
        "cozy-sm": "0 14px 34px -22px rgba(16, 28, 45, 0.30)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s ease-out both",
        "pulse-soft": "pulse-soft 1.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
