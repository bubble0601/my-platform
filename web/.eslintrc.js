/** @type {import('@types/eslint').Linter.BaseConfig} */
module.exports = {
  extends: [
    '../.eslintrc.js',
    '@remix-run/eslint-config',
    '@remix-run/eslint-config/node',
    'plugin:storybook/recommended',
  ],
}
