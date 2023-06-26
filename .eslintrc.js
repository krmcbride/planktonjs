module.exports = {
  env: {
    node: true,
  },
  extends: ['airbnb-base', 'prettier'],
  parserOptions: {
    ecmaVersion: 2019,
    sourceType: 'script',
  },
  overrides: [
    {
      files: ['packages/**/*.ts'],
      extends: ['airbnb-typescript/base', 'plugin:@typescript-eslint/recommended', 'prettier'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
      },
      plugins: ['@typescript-eslint'],
      rules: {
        'max-classes-per-file': 'off',
      },
    },
    {
      files: ['packages/**/*.test.ts', 'packages/**/__tests__/**/*.ts'],
      env: {
        jest: true,
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
  ],
};
