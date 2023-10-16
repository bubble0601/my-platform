/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  extends: ["@internal/eslint-config/react", "plugin:storybook/recommended"],
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
