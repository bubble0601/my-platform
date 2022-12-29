// @ts-check
const OFF = 0
const WARN = 1
const ERROR = 2

/** @type {import('eslint').Linter.BaseConfig} */
module.exports = {
  plugins: ['import'],
  extends: ['./.eslintrc.base', 'plugin:import/recommended', 'plugin:import/typescript'],
  settings: {
    'import/resolver': {
      typescript: true,
      node: true,
    },
  },
  rules: {
    'import/no-named-as-default-member': OFF,
    'import/no-named-as-default': OFF,
    'import/no-extraneous-dependencies': [
      ERROR,
      {
        devDependencies: false,
      },
    ],
    'import/order': [
      ERROR,
      {
        alphabetize: {
          order: 'asc',
        },
        pathGroups: [
          {
            pattern: '~/**',
            group: 'parent',
          },
        ],
      },
    ],
  },
}
