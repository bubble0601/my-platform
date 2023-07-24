/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ["@internal"],
  ignorePatterns: [
    "build.js",
    "dist",
    "src/schema/resolvers-types.ts",
    "src/db/types.ts",
  ],
  root: true,
};
