module.exports = {
  root: true,
  extends: '@daotl/eslint-config/typescript',
  env: {
    jest: true,
  },
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  ignorePatterns: ['.eslintrc.js'],
}
