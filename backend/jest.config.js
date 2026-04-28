/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  setupFiles: ['<rootDir>/tests/setup-env.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/server.ts',
    '!src/lib/env.ts',
    '!src/**/index.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  clearMocks: true,
  testTimeout: 20000,
  maxWorkers: 1,
};
