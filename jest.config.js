module.exports = {
  preset: 'jest-expo',
  testPathIgnorePatterns: [
    '<rootDir>/__tests__/setup.ts',
    '<rootDir>/__tests__/utils/testUtils.tsx'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(isows|@supabase|@react-native|react-native|@expo|expo|expo-modules-core|expo-font|@expo/vector-icons|@react-navigation|react-native-reanimated|react-native-gesture-handler|react-native-vector-icons|@react-native-community|react-native-safe-area-context|react-native-screens)/)'
  ],
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  collectCoverageFrom: [
    'stores/**/*.{ts,tsx}',
    'services/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html']
}; 