// @ts-check
const OFF = 0;
const WARN = 1;
const ERROR = 2;

/** @type {import('eslint').Linter.BaseConfig} */
module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/strict-type-checked",
    "plugin:@typescript-eslint/stylistic-type-checked",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "prettier",
    "turbo",
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
    "@typescript-eslint/ban-types": [ERROR, { types: { "{}": false } }],
    "@typescript-eslint/ban-ts-comment": WARN,
    "@typescript-eslint/no-empty-interface": WARN,
    "import/default": OFF,
    "import/named": OFF,
    "import/namespace": OFF,
    "import/no-named-as-default-member": OFF,
    "import/order": [
      ERROR,
      {
        alphabetize: {
          order: "asc",
        },
        pathGroups: [
          {
            pattern: "~/**",
            group: "parent",
          },
        ],
      },
    ],
    "@typescript-eslint/consistent-type-definitions": OFF,
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
    "turbo/no-undeclared-env-vars": WARN,
  },
};
