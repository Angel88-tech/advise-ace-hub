import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['DM Sans', 'sans-serif'],
      },
      colors: {
  border: "#8a491e",
  input: "#3b82f6",
  ring: "#e3e6eb",

  background: "#0f172a",
  foreground: "#ffffff",

  primary: {
    DEFAULT: "#2563eb",
    foreground: "#ffffff",
  },

  secondary: {
    DEFAULT: "#1e40af",
    foreground: "#fffafa",
  },

  destructive: {
    DEFAULT: "#dc2626",
    foreground: "#e2e3ea",
  },

  muted: {
    DEFAULT: "#42637e",
    foreground: "#8b8988",
  },

  accent: {
    DEFAULT: "#38bdf8",
    foreground: "#0f172a",
  },

  popover: {
    DEFAULT: "#1e3a8a",
    foreground: "#ffffff",
  },

  card: {
    DEFAULT: "#131a32a0",
    foreground: "#ffffff",
  },

  sidebar: {
    DEFAULT: "#020617",
    foreground: "#ffffff",
    primary: "#2563eb",
    "primary-foreground": "#ffffff",
    accent: "#38bdf8",
    "accent-foreground": "#0f172a",
    border: "#1e3a8a",
    ring: "#2563eb",
  },

  chart: {
    1: "#101a2f",
    2: "#1a263a",
    3: "#1a3557",
    4: "#0c1635",
    5: "#0f172a",
  },
},

      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      boxShadow: {
        'glow': 'var(--shadow-glow)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
