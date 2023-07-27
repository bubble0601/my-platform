/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  extends: ["@internal"],
  ignorePatterns: [
    "build.js",
    "dist",
    "src/db/types.ts",
    "src/schema/types.ts",
    "src/modules/*/module-types.ts",
    "src/schema/schema.gql",
  ],
  overrides: [
    {
      files: ["src/modules/*/schema.gql"],
      extends: "plugin:@graphql-eslint/schema-recommended",
      parserOptions: {
        schema: "./src/**/schema.gql",
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
