module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended'
  ],
  plugins: ['@typescript-eslint', 'react'],
  rules: {
    semi: [2, 'never'],
    '@typescript-eslint/explicit-function-return-type': 'off'
  }
}