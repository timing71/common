module.exports = {
  env: {
    browser: true,
    es2021: true,
    'jest/globals': true
  },
  extends: 'standard',
  overrides: [
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: [
    'jest'
  ],
  rules: {
    'brace-style': ['error', 'stroustrup'],
    'dot-notation': 'off',
    'operator-linebreak': ['warn', 'after'],
    'quote-props': 'off',
    'semi': ['warn', 'always'],
    'space-before-function-paren': ['error', 'never']
  }
};
