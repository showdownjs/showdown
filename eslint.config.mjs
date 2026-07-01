// Flat ESLint config — replaces the legacy .eslintrc.json + .jshintrc (JSHint dropped).
//
// Two tiers of severity:
//   - Formatting/style (ported verbatim from .eslintrc.json, now under @stylistic) → ERROR.
//     The codebase already satisfies these, so they gate CI as before.
//   - eslint:recommended (+ eqeqeq) → WARN. These surface real correctness issues we intend
//     to fix after the toolchain modernization; kept non-blocking for now so they don't gate
//     CI. `no-undef` stays off: src/ is shared-scope concatenation, so identifiers legitimately
//     cross file boundaries (this is why the old JSHint used `undef:false`).

import js from '@eslint/js';
import globals from 'globals';
import stylistic from '@stylistic/eslint-plugin';

// eslint:recommended, every rule downgraded to a warning.
const recommendedAsWarn = Object.fromEntries(
  Object.entries(js.configs.recommended.rules).map(([name, setting]) => (
    Array.isArray(setting) ? [name, ['warn', ...setting.slice(1)]] : [name, 'warn']
  ))
);

const coreRules = {
  curly: ['error', 'all'],
  camelcase: ['error', { properties: 'never' }],
  'no-multi-str': 'error'
};

const styleRules = {
  '@stylistic/indent': ['error', 2, { SwitchCase: 1, VariableDeclarator: 2 }],
  '@stylistic/operator-linebreak': ['error', 'after'],
  '@stylistic/quotes': ['error', 'single'],
  '@stylistic/no-mixed-spaces-and-tabs': 'error',
  '@stylistic/space-unary-ops': ['error', { nonwords: false, overrides: {} }],
  '@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: true }],
  '@stylistic/keyword-spacing': ['error', {}],
  '@stylistic/space-infix-ops': 'error',
  '@stylistic/space-before-blocks': ['error', 'always'],
  '@stylistic/eol-last': ['error', 'always'],
  '@stylistic/space-before-function-paren': ['error', 'always'],
  '@stylistic/array-bracket-spacing': ['error', 'never', { singleValue: false }],
  '@stylistic/space-in-parens': ['error', 'never']
};

const rules = {
  ...recommendedAsWarn,
  'no-undef': 'off',
  eqeqeq: 'warn',
  ...coreRules,
  ...styleRules
};

const plugins = { '@stylistic': stylistic };

export default [
  {
    ignores: ['dist/**', 'bin/**', '.build/**', 'node_modules/**', '.claude/**', 'test/functional/**/cases/**']
  },
  {
    // Library source: shared-scope concatenated scripts (not modules).
    files: ['src/**/*.js'],
    plugins,
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'script',
      globals: { ...globals.browser, ...globals.node, showdown: 'writable', define: 'readonly' }
    },
    rules
  },
  {
    // Tests: run under Mocha with chai + showdown globals.
    files: ['test/**/*.js'],
    plugins,
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'script',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.mocha,
        showdown: 'writable',
        getDefaultOpts: 'readonly',
        chai: 'readonly',
        expect: 'readonly',
        XMLHttpRequest: 'writable'
      }
    },
    rules
  },
  {
    // Build scripts: real ES modules.
    files: ['scripts/**/*.mjs', 'eslint.config.mjs'],
    plugins,
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.node }
    },
    rules
  }
];
