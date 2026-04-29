import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import json from '@eslint/json'
import {defineConfig} from 'eslint/config'

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    plugins: { js },
    extends: ['js/recommended'],
    languageOptions: { globals: globals.node },
    rules: {
      'brace-style': ['warn', '1tbs', {'allowSingleLine': true}],

      'no-unused-vars': 'warn',
      'no-undef': 'error',
      'no-console': 'warn',
      'eqeqeq': ['warn', 'always'],
      'no-var': 'error',
      'prefer-const': 'warn',
      'no-multi-assign': 'error',

      'arrow-spacing': ['warn', {
        'before': true,
        'after': true
      }],
      'arrow-parens': ['warn', 'as-needed'],
      'no-duplicate-imports': 'error',

      'semi': ['error', 'never'],
      'quotes': ['error', 'single', { 'avoidEscape': true }],
      'indent': ['error', 2],
      'comma-dangle': ['warn', 'never'],

      'no-trailing-spaces': 'error',
      'eol-last': ['error', 'always'],

      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-return-await': 'warn',

      'function-paren-newline': ['error', 'multiline-arguments'],
      'function-call-argument-newline': ['error', 'consistent'],

      'object-curly-newline': ['error', {
        'ObjectExpression': {
          'minProperties': 5,
          'multiline': true,
          'consistent': true
        },
        'ObjectPattern': {
          'minProperties': 5,
          'multiline': true,
          'consistent': true
        },
        'ImportDeclaration': 'never',
        'ExportDeclaration': {
          'minProperties': 5,
          'multiline': true,
          'consistent': true
        }
      }],
      'object-property-newline': ['error', {
        'allowAllPropertiesOnSameLine': false
      }]

    }
  },
  tseslint.configs.recommended,
  {
    files: ['**/*.json'],
    plugins: { json },
    language: 'json/json',
    extends: ['json/recommended']
  }
])
