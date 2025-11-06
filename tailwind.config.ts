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
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: "hsl(var(--primary))",
        secondary: "hsl(var(--secondary-ocean))",
        card: "hsl(var(--card))",
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        danger: "hsl(var(--danger))",
        info: "hsl(var(--info))",
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
