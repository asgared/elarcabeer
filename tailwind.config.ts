import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/layouts/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1440px",
      },
    },
    extend: {
      colors: {
        background: "#0c1b1e",
        foreground: "#f0f6f8",
        accent: {
          DEFAULT: "#38b2ac",
          foreground: "#0c1b1e",
        },
        muted: {
          DEFAULT: "#102327",
          foreground: "#d4e4e7",
        },
        warning: {
          DEFAULT: "#f6ad55",
          foreground: "#2d1600",
        },
        danger: {
          DEFAULT: "#e53e3e",
          foreground: "#fff5f5",
        },
      },
      borderRadius: {
        xl: "1.25rem",
        lg: "1rem",
        md: "0.75rem",
        sm: "0.5rem",
      },
      boxShadow: {
        brand: "0 15px 30px -10px rgba(56, 178, 172, 0.35)",
        card: "0 20px 45px -20px rgba(12, 27, 30, 0.55)",
        soft: "0 4px 12px rgba(0, 0, 0, 0.15)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", ...defaultTheme.fontFamily.sans],
        serif: ["var(--font-playfair)", ...defaultTheme.fontFamily.serif],
      },
    },
  },
  plugins: [],
};

export default config;
