// @ts-check
const OFF = 0
const WARN = 1
const ERROR = 2

/** @type {import('eslint').Linter.BaseConfig} */
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'turbo',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: { tsconfigRootDir: '.' },
  ignorePatterns: ['*.js'],
  rules: {
    '@typescript-eslint/ban-types': [ERROR, { types: { '{}': false } }],
    '@typescript-eslint/ban-ts-comment': WARN,
    '@typescript-eslint/no-unused-vars': [WARN, { varsIgnorePattern: '^_' }],
    '@typescript-eslint/no-empty-interface': WARN,
    'prettier/prettier': WARN,
    'turbo/no-undeclared-env-vars': WARN,
  },
}
