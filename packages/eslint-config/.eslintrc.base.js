// @ts-check
const OFF = 0
const WARN = 1
const ERROR = 2

/** @type {import('eslint').Linter.BaseConfig} */
module.exports = {
  extends: ['plugin:@typescript-eslint/recommended', 'prettier', 'turbo'],
  parser: '@typescript-eslint/parser',
  parserOptions: { project: 'tsconfig.json' },
  ignorePatterns: ['.eslintrc*.js', '*.d.ts'],
  rules: {
    '@typescript-eslint/no-unused-vars': [WARN, { varsIgnorePattern: '^_' }],
    'turbo/no-undeclared-env-vars': WARN,
  },
}
