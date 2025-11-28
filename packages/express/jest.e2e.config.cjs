const { createDefaultPreset } = require('ts-jest');

const tsJestTransformCfg = createDefaultPreset().transform;
const packageJson = require('./package.json');
const path = require('path');
const resolvedBuiltEntry = path.resolve(__dirname, packageJson.main); // E2E tests run against built code in dist

/** @type {import("jest").Config} **/
module.exports = {
  roots: ['<rootDir>/tests/e2e'],
  testEnvironment: 'node',
  transform: {
    ...tsJestTransformCfg,
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],

  // Redirect "@zistr/core" to the *built* output
  moduleNameMapper: {
    '^@zistr/express$': resolvedBuiltEntry,
  },
};
