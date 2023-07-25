// @ts-check
const OFF = 0;
const WARN = 1;
const ERROR = 2;

/** @type {import('eslint').Linter.BaseConfig} */
module.exports = {
  plugins: ["tailwindcss"],
  extends: [
    "airbnb",
    "airbnb/hooks",
    "./.eslintrc.base",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:jsx-a11y/recommended",
    "plugin:@next/next/recommended",
  ],
  settings: {
    react: {
      version: "detect",
    },
  },
  rules: {
    "no-console": WARN,
    "jsx-a11y/label-has-associated-control": [
      ERROR,
      {
        assert: "either",
      },
    ],
    "react/function-component-definition": [
      ERROR,
      {
        namedComponents: "arrow-function",
        unnamedComponents: "arrow-function",
      },
    ],
    "react/jsx-filename-extension": [
      ERROR,
      {
        extensions: [".tsx"],
      },
    ],
    "tailwindcss/enforces-negative-arbitrary-values": ERROR,
    "tailwindcss/enforces-shorthand": ERROR,
    "tailwindcss/migration-from-tailwind-2": ERROR,
    "tailwindcss/no-arbitrary-value": WARN,
    "tailwindcss/no-custom-classname": WARN,
    "tailwindcss/no-contradicting-classname": ERROR,
  },
};
