// @ts-check
const OFF = 0;
const WARN = 1;
const ERROR = 2;

/** @type {import('eslint').Linter.BaseConfig} */
module.exports = {
  extends: [
    "airbnb-base",
    "plugin:unicorn/recommended",
    "plugin:@typescript-eslint/strict-type-checked",
    "plugin:@typescript-eslint/stylistic-type-checked",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "prettier",
  ],
  ignorePatterns: ["*.js"],
  parser: "@typescript-eslint/parser",
  parserOptions: { project: "tsconfig.json" },
  settings: {
    "import/resolver": {
      typescript: true,
      node: true,
    },
  },
  rules: {
    "arrow-body-style": OFF,
    "max-classes-per-file": OFF,
    "no-restricted-syntax": [
      ERROR,
      {
        selector: "ForInStatement",
        message:
          "for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.",
      },
      {
        selector: "LabeledStatement",
        message:
          "Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.",
      },
      {
        selector: "WithStatement",
        message:
          "`with` is disallowed in strict mode because it makes code impossible to predict and optimize.",
      },
    ],
    "@typescript-eslint/ban-types": [ERROR, { types: { "{}": false } }],
    "@typescript-eslint/consistent-type-definitions": OFF,
    "@typescript-eslint/no-empty-interface": OFF,
    "@typescript-eslint/no-misused-promises": [
      ERROR,
      {
        checksConditionals: true,
        checksSpreads: true,
        checksVoidReturn: false,
      },
    ],
    "@typescript-eslint/no-throw-literal": [
      WARN,
      {
        allowThrowingAny: true,
      },
    ],
    "@typescript-eslint/no-unused-vars": [
      WARN,
      { varsIgnorePattern: "^_", argsIgnorePattern: "^_" },
    ],
    "import/default": OFF,
    "import/extensions": OFF,
    "import/named": OFF,
    "import/namespace": OFF,
    "import/no-named-as-default-member": OFF,
    "import/order": OFF,
    "import/prefer-default-export": OFF,
    "unicorn/no-null": OFF,
    // TODO: migrate to esm
    "unicorn/prefer-module": OFF,
    "unicorn/prevent-abbreviations": OFF,
  },
};
