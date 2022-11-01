// @ts-check
/** @type {import('eslint').Linter.BaseConfig} */
module.exports = {
  extends: ['./.eslintrc.base', 'plugin:import/recommended', 'plugin:import/typescript'],
  settings: {
    'import/resolver': {
      typescript: true,
      node: true,
    },
  },
}
