/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ['@internal/eslint-config/next'],
  ignorePatterns: ['src/@generated'],
  root: true,
}
