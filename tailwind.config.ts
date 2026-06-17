import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        kaem: {
          50: "#EBF5FF",
          100: "#D6EBFF",
          200: "#ADD6FF",
          300: "#7ABFFF",
          400: "#4DA3FF",
          500: "#2E86DE",
          600: "#1A6FCC",
          700: "#1456A8",
          800: "#0D3F7F",
          900: "#0A2D5C",
        },
        primary: {
          DEFAULT: "#2E86DE",
          50: "#EBF5FF",
          100: "#D6EBFF",
          200: "#ADD6FF",
          300: "#7ABFFF",
          400: "#4DA3FF",
          500: "#2E86DE",
          600: "#1A6FCC",
          700: "#1456A8",
          800: "#0D3F7F",
          900: "#0A2D5C",
        },
        background: {
          DEFAULT: "#FFFFFF",
          subtle: "#F8FAFC",
        },
        border: {
          DEFAULT: "#E2E8F0",
        },
        success: {
          DEFAULT: "#10B981",
        },
        error: {
          DEFAULT: "#EF4444",
        },
        warning: {
          DEFAULT: "#F59E0B",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "12px",
        input: "10px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)",
        "card-hover": "0 10px 24px rgba(15, 23, 42, 0.09)",
        form: "0 20px 50px rgba(15, 23, 42, 0.10)",
        button: "0 4px 12px rgba(26, 111, 204, 0.24)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
