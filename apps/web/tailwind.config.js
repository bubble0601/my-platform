const colors = require("tailwindcss/colors");
const taileindTypography = require("@tailwindcss/typography");
const tailwindAnimate = require("tailwindcss-animate");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
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
    },
  },
  plugins: [tailwindAnimate, taileindTypography],
};
