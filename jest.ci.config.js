const config = require('./jest.config');

// Add integration tests and test result reporter
config.testMatch.push('<rootDir>/packages/*/__tests__/**/*.itest.ts');
config.reporters = [
  'default',
  [
    'jest-junit',
    {
      addFileAttribute: 'true',
      outputDirectory: './test-results/jest',
      outputName: 'results.xml',
    },
  ],
];
config.setupFilesAfterEnv = ['./jest.ci.setup.js'];

module.exports = config;
