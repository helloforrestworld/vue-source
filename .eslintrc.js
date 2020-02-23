module.exports = {
  env: {
    browser: true,
    es6: true
  },
  extends: [
    'standard'
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  rules: {
    semi: [1, 'never'],
    'space-before-function-paren': 0,
    'no-unused-vars': 1,
    'no-new': 0,
    'no-cond-assign': 0,
    'no-prototype-builtins': 0
  }
}
