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
        brand: {
          50: "#0C1B1E",
          100: "#10272D",
          200: "#133A43",
          300: "#1F515C",
          400: "#2B6B77",
          500: "#35A3B3",
          600: "#4BC0CD",
          700: "#6FD6E0",
          800: "#9AE7EE",
          900: "#D6F8FB",
        },
        gold: {
          500: "#C6A15B",
        },
        sand: {
          500: "#DCC9A6",
        },
        background: {
          800: "#10272D",
          900: "#0C1B1E",
        },
        foreground: "#f0f6f8",
        accent: {
          DEFAULT: "#35A3B3",
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
        success: {
          DEFAULT: "#28a745",
          foreground: "#f0fff4",
        },
        info: {
          DEFAULT: "#007bff",
          foreground: "#f0f6ff",
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
        heading: ["var(--font-playfair)", ...defaultTheme.fontFamily.sans],
        body: ["var(--font-inter)", ...defaultTheme.fontFamily.sans],
        sans: ["var(--font-inter)", ...defaultTheme.fontFamily.sans],
        serif: ["var(--font-playfair)", ...defaultTheme.fontFamily.serif],
      },
    },
  },
  plugins: [],
};

export default config;
