/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  extends: ["@internal/eslint-config/next", "plugin:storybook/recommended"],
  ignorePatterns: ["app/_gql"],
  // processor: "@graphql-eslint/graphql",
  // overrides: [
  //   {
  //     files: ["*.{gql,graphql}"],
  //     extends: "plugin:@graphql-eslint/operations-recommended",
  //     parserOptions: {
  //       operations: ["./app/**/*.gql", "./app/**/*.graphql", "./app/**/*.tsx"],
  //     },
  //   },
  // ],
  overrides: [
    {
      files: ["*.stories.tsx"],
      rules: {
        "import/no-extraneous-dependencies": "off",
        "react/jsx-key": "off",
        "react-hooks/rules-of-hooks": "off",
      },
    },
  ],
};
