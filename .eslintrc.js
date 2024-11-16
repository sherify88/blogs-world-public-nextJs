module.exports = {
    env: {
      browser: true,
      es2021: true,
    },
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'next/core-web-vitals',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
      ecmaVersion: 12,
      sourceType: 'module',
    },
    plugins: ['@typescript-eslint'],
    rules: {
      // Adjust these rules to avoid errors
      '@typescript-eslint/no-explicit-any': 'off', // Turn off no-explicit-any
      '@typescript-eslint/no-unused-vars': [
        'warn', // Turn no-unused-vars into a warning instead of an error
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: true,
          varsIgnorePattern: '^_', // Allow unused variables prefixed with an underscore
        },
      ],
      // Add other rules you might want to adjust
    },
  };
  