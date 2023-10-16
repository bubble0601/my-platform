const colors = require("tailwindcss/colors");
const taileindTypography = require("@tailwindcss/typography");
const tailwindAnimate = require("tailwindcss-animate");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    data: {
      open: "state~=open",
      closed: "state~=closed",
      top: "side~=top",
      left: "side~=left",
      bottom: "side~=bottom",
      right: "side~=right",
    },
    colors: {
      transparent: "transparent",
      current: "currentColor",
      black: colors.black,
      white: colors.white,
      zinc: colors.zinc,
      indigo: colors.indigo,
      red: colors.red,
      amber: colors.amber,
      green: colors.green,
      border: "hsl(var(--border))",
      input: "hsl(var(--input))",
      ring: "hsl(var(--ring))",
      background: "hsl(var(--background))",
      foreground: "hsl(var(--foreground))",
      popover: {
        DEFAULT: "hsl(var(--popover))",
        foreground: "hsl(var(--popover-foreground))",
      },
      card: {
        DEFAULT: "hsl(var(--card))",
        foreground: "hsl(var(--card-foreground))",
      },
      accent: {
        DEFAULT: "hsl(var(--accent))",
        foreground: "hsl(var(--accent-foreground))",
      },
      muted: {
        DEFAULT: "hsl(var(--muted))",
        foreground: "hsl(var(--muted-foreground))",
      },
      destructive: {
        DEFAULT: "hsl(var(--destructive))",
        foreground: "hsl(var(--destructive-foreground))",
      },
    },
    extend: {
      height: {
        screen: ["100dvh"],
      },
      minHeight: {
        screen: ["100dvh"],
      },
      maxHeight: {
        screen: ["100dvh"],
      },
      minWidth: ({ theme }) => theme("spacing"),
    },
  },
  plugins: [tailwindAnimate, taileindTypography],
};
