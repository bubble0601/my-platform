/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ['@internal/eslint-config'],
  ignorePatterns: ['build.js', 'dist', 'src/@generated', 'nexus-types.d.ts'],
  root: true,
}
