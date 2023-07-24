// @ts-check
const OFF = 0;
const WARN = 1;
const ERROR = 2;

/** @type {import('eslint').Linter.BaseConfig} */
module.exports = {
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
  },
};
