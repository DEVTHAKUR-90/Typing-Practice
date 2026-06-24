import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        midnight: "#0B0F2B",
        "midnight-deep": "#060814",
        aurora: {
          teal: "#0FD8C2",
          magenta: "#C770F0",
          blue: "#4C6FFF",
        },
        amber: "#FFB454",
        coral: "#FF5D6C",
        ink: "#F4F6FB",
        muted: "#8B93B8",
        glass: {
          DEFAULT: "rgba(255,255,255,0.06)",
          border: "rgba(255,255,255,0.14)",
          hover: "rgba(255,255,255,0.10)",
        },
      },
      fontFamily: {
        display: ["var(--font-sora)", "sans-serif"],
        mono: ["var(--font-space-mono)", "monospace"],
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(6, 8, 20, 0.37)",
        glow: "0 0 24px 0 rgba(15, 216, 194, 0.35)",
        "glow-amber": "0 0 18px 0 rgba(255, 180, 84, 0.55)",
        "glow-coral": "0 0 18px 0 rgba(255, 93, 108, 0.55)",
      },
      keyframes: {
        drift: {
          "0%, 100%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -40px) scale(1.08)" },
          "66%": { transform: "translate(-25px, 25px) scale(0.96)" },
        },
        "caret-pulse": {
          "0%, 100%": { opacity: "1", transform: "scaleY(1)" },
          "50%": { opacity: "0.55", transform: "scaleY(0.85)" },
        },
        "crack-flash": {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-130%) skewX(-12deg)" },
          "100%": { transform: "translateX(230%) skewX(-12deg)" },
        },
        "danger-pulse": {
          "0%, 100%": { opacity: "0" },
          "50%": { opacity: "0.55" },
        },
      },
      animation: {
        drift: "drift 22s ease-in-out infinite",
        "drift-slow": "drift 34s ease-in-out infinite reverse",
        "caret-pulse": "caret-pulse 1.4s cubic-bezier(0.45, 0, 0.55, 1) infinite",
        "crack-flash": "crack-flash 0.4s ease-out forwards",
        "fade-up": "fade-up 0.5s ease-out forwards",
        shimmer: "shimmer 7s ease-in-out infinite",
        "danger-pulse": "danger-pulse 0.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
