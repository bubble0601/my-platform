/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ["@internal/eslint-config/next"],
  ignorePatterns: ["app/_gql"],
  root: true,
};
