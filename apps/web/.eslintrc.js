/** @type {import('eslint').Linter.BaseConfig} */
module.exports = {
  extends: ['@internal/eslint-config/next'],
  ignorePatterns: ['src/@generated'],
}
