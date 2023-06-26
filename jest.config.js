module.exports = {
  clearMocks: true,
  moduleFileExtensions: ['js', 'ts'],
  modulePathIgnorePatterns: ['<rootDir>/packages/*/dist'],
  preset: 'ts-jest',
  testMatch: ['<rootDir>/packages/**/*.test.ts'],
};
