/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ["@internal/eslint-config"],
  ignorePatterns: [
    "build.js",
    "dist",
    "src/schema/resolvers-types.ts",
    "src/db/types.ts",
  ],
  root: true,
};
