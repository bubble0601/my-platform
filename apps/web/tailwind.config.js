const preset = require("@internal/ui/tailwind-preset");

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [preset],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@internal/ui/src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
};
