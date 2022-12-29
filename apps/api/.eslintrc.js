/** @type {import('eslint').Linter.BaseConfig} */
module.exports = {
  extends: ['@internal/eslint-config'],
  ignorePatterns: ['build.js', 'dist', 'src/@generated'],
}
