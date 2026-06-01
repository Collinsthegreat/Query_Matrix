import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--bg-primary)",
        secondary: "var(--bg-secondary)",
        card: "var(--bg-card)",
        input: "var(--bg-input)",
        border: "var(--border)",
        foreground: "var(--text-primary)",
        muted: "var(--text-muted)",
        accent: "var(--accent)",
        danger: "var(--danger)",
        success: "var(--success)",
        warning: "var(--warning)"
      },
      fontFamily: {
        sans: "var(--font-sans)",
        mono: "var(--font-mono)"
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        DEFAULT: "var(--radius)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)"
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        glow: "var(--shadow-glow)",
        success: "var(--shadow-glow-success)",
        danger: "var(--shadow-glow-danger)"
      }
    }
  },
  plugins: []
};

export default config;
