module.exports = {
  'env': {
    'commonjs': true,
    'es2020': true,
    'node': true,
    "jest/globals": true
  },
  'extends': [
    'eslint:recommended',
  ],
  "plugins": ["jest"],
  'parserOptions': {
    'ecmaVersion': 11,
  },
  'rules': {
    "semi": "error",
    "no-tabs": "error",
    "no-console": "off"
  },
};
