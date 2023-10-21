// @ts-check

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
  ],
  settings: {
    react: {
      version: "detect",
    },
  },
  rules: {
    "no-console": "warn",
    "prefer-arrow-callback": ["error", { allowNamedFunctions: true }],
    "jsx-a11y/label-has-associated-control": [
      "error",
      {
        assert: "either",
      },
    ],
    "react/self-closing-comp": "off",
    "react/function-component-definition": [
      "error",
      {
        namedComponents: ["arrow-function", "function-declaration"],
        unnamedComponents: "arrow-function",
      },
    ],
    "react/jsx-key": [
      "error",
      {
        checkFragmentShorthand: true,
      },
    ],
    "react/jsx-filename-extension": [
      "error",
      {
        extensions: [".tsx"],
      },
    ],
    "react/jsx-no-useless-fragment": ["error", { allowExpressions: true }],
    "react/jsx-props-no-spreading": "off",
    "react/require-default-props": "off",
    "tailwindcss/enforces-negative-arbitrary-values": "error",
    "tailwindcss/enforces-shorthand": "error",
    "tailwindcss/migration-from-tailwind-2": "error",
    "tailwindcss/no-arbitrary-value": "warn",
    "tailwindcss/no-custom-classname": "warn",
    "tailwindcss/no-contradicting-classname": "error",
  },
};
