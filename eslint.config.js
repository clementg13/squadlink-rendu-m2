const js = require('@eslint/js');
const typescript = require('@typescript-eslint/eslint-plugin');
const typescriptParser = require('@typescript-eslint/parser');
const react = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks');
const reactNative = require('eslint-plugin-react-native');

module.exports = [
  // Base configuration
  js.configs.recommended,
  
  // Global ignores - These files won't be processed at all
  {
    ignores: [
      'node_modules/**',
      'android/**',
      'ios/**',
      '.expo/**',
      'dist/**',
      'build/**',
      '*.config.js',
      '*.config.ts',
      'babel.config.js',
      'metro.config.js',
      'expo-env.d.ts',
      'coverage/**',
      '__tests__/**',
      '**/*.test.{js,ts,tsx}',
      '**/*.spec.{js,ts,tsx}',
      'eslint.config.js', // Ignore the config file itself
      'components/__tests__/**' // Ignore Jest test files
    ]
  },
  
  // Configuration for TypeScript/React files
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: 2021,
        sourceType: 'module',
        project: './tsconfig.json',
      },
      globals: {
        __DEV__: 'readonly',
        React: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        require: 'readonly',
        module: 'readonly',
        global: 'readonly',
        window: 'readonly',
        process: 'readonly',
      },
    },
    
    plugins: {
      '@typescript-eslint': typescript,
      'react': react,
      'react-hooks': reactHooks,
      'react-native': reactNative,
    },
    
    rules: {
      // TypeScript rules
      '@typescript-eslint/no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-empty-function': 'warn',
      
      // React rules
      'react/react-in-jsx-scope': 'off', // Not needed in React 17+
      'react/prop-types': 'off', // Using TypeScript instead
      'react/display-name': 'off',
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
      
      // React Hooks rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      
      // React Native specific rules (less strict for development)
      'react-native/no-unused-styles': 'warn',
      'react-native/split-platform-components': 'off',
      'react-native/no-inline-styles': 'off', // Allow for development
      'react-native/no-color-literals': 'off', // Allow for development
      'react-native/no-raw-text': 'off',
      
      // General rules
      'no-console': 'off', // Allow console in development
      'prefer-const': 'error',
      'no-var': 'error',
      'no-unused-vars': 'off', // Use TypeScript version instead
      'no-undef': 'off', // TypeScript handles this better
    },
    
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
];
