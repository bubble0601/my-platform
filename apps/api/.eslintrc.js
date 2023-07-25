/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  extends: ["@internal"],
  ignorePatterns: [
    "build.js",
    "dist",
    "src/schema/resolvers-types.ts",
    "src/db/types.ts",
  ],
  overrides: [
    {
      files: ["*.gql"],
      extends: "plugin:@graphql-eslint/schema-recommended",
      parserOptions: {
        schema: "./src/**/*.gql",
      },
      rules: {
        "@graphql-eslint/require-description": "off",
        "@graphql-eslint/strict-id-in-types": [
          "error",
          { exceptions: { suffixes: ["Response"] } },
        ],
      },
    },
  ],
};
