import globals from "globals";
import mdcs_eslint from "eslint-config-mdcs";


export default [
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser
      },
    },
    files: ['build/**/*.js'],
    plugins: {},
    rules: {
      ...mdcs_eslint.rules,
      'padding-line-between-statements': [
        'error',
        { 'blankLine': 'always', 'prev': '*', 'next': 'export' },
        { 'blankLine': 'always', 'prev': 'export', 'next': '*' },
        { 'blankLine': 'always', 'prev': 'import', 'next': '*' },
        { 'blankLine': 'never', 'prev': 'import', 'next': 'import' },
        { 'blankLine': 'always', 'prev': '*', 'next': 'class' },
        { 'blankLine': 'always', 'prev': 'class', 'next': '*' },
        { 'blankLine': 'always', 'prev': 'block-like', 'next': '*' },
        { 'blankLine': 'always', 'prev': '*', 'next': 'block-like' },
        { 'blankLine': 'always', 'prev': ['multiline-expression', 'multiline-const', 'multiline-let', 'multiline-block-like'], 'next': '*' },
        { 'blankLine': 'always', 'prev': '*', 'next': ['multiline-expression', 'multiline-const', 'multiline-let', 'multiline-block-like'] },
        { 'blankLine': 'always', 'prev': ['if', 'case', 'switch'], 'next': '*' },
        { 'blankLine': 'always', 'prev': '*', 'next': ['if', 'case', 'switch'] },
        { 'blankLine': 'always', 'next': ['switch'], 'prev': '*' }
      ],
      'lines-around-comment': ['error', { 'beforeBlockComment': true, 'beforeLineComment': true }],
      'no-cond-assign': 'off',
      'no-fallthrough': 'off'
    },
  },
  {
    ignores: [],
  },
]
