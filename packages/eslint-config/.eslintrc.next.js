// @ts-check
const OFF = 0
const WARN = 1
const ERROR = 2

/** @type {import('eslint').Linter.BaseConfig} */
module.exports = {
  extends: ['./.eslintrc.base', 'next/core-web-vitals'],
  rules: {
    'import/no-extraneous-dependencies': ERROR,
  },
}
