import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cozy Tops brand palette — warm, soft, tactile.
        cream: "#FAF4EB",
        oat: "#F1E7D6",
        terracotta: {
          DEFAULT: "#C9683E",
          soft: "#E0875E",
          deep: "#9E4B27",
        },
        sage: {
          DEFAULT: "#7E8B6B",
          soft: "#A6B193",
          deep: "#5C6650",
        },
        cocoa: "#3B2C24",
        ink: "#241A15",
        butter: "#F4C56B",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        cozy: "1.75rem",
      },
      boxShadow: {
        cozy: "0 18px 48px -24px rgba(59, 44, 36, 0.45)",
        "cozy-sm": "0 8px 24px -16px rgba(59, 44, 36, 0.5)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        knit: {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "28px 0" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out both",
        knit: "knit 1.2s linear infinite",
        "pulse-soft": "pulse-soft 1.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
