/* eslint-disable no-undef */
const eslintPlugin = require('@typescript-eslint/eslint-plugin');
const parser = require('@typescript-eslint/parser');
const js = require('@eslint/js');

module.exports = [
    js.configs.recommended,
    {
        files: ['**/*.ts'],
        languageOptions: {
            parser,
            parserOptions: {
                project: './tsconfig.json',
            },
        },
        plugins: {
            '@typescript-eslint': eslintPlugin,
        },
        rules: {
            ...eslintPlugin.configs.recommended.rules,
            'no-undef': 'off',
            '@typescript-eslint/no-require-imports': 'off',
        },
    },
    {
        ignores: ['.sfdx/**', 'build/**', 'dist/**', 'test/**', 'coverage/**', 'jest.config.js'],
    },
];
