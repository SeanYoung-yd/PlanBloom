import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
      colors: {
        bloom: {
          bg: "var(--color-bg)",
          surface: "var(--color-surface)",
          soft: "var(--color-surface-soft)",
          text: "var(--color-text)",
          muted: "var(--color-text-muted)",
          border: "var(--color-border)",
          primary: "var(--color-primary)",
          coral: "var(--color-coral)",
          sky: "var(--color-sky)",
          yellow: "var(--color-yellow)",
          lilac: "var(--color-lilac)",
          mint: "var(--color-mint)",
        },
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        sticker: "var(--shadow-sticker)",
      },
      borderRadius: {
        card: "var(--radius-card)",
        control: "var(--radius-control)",
      },
    },
  },
  plugins: [],
} satisfies Config;
