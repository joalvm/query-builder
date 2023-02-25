module.exports = {
    env: {
        es2021: true,
        jest: true,
    },
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
    overrides: [],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 'latest',
        sourceType: 'module',
    },
    plugins: ['@typescript-eslint', 'prettier', 'simple-import-sort'],
    settings: {
        'import/resolver': {
            typescript: {},
        },
    },
    rules: {
        'spaced-comment': 'error',
        'no-duplicate-imports': 'error',
        'simple-import-sort/imports': 'error',
        '@typescript-eslint/no-empty-function': 'off',
        'class-methods-use-this': 'off',
    },
};
