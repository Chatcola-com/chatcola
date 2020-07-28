module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.test.json'
    }
  },
  setupFiles: [ "./__tests__/setup.ts" ],
  testPathIgnorePatterns: [ "setup.ts" ]
};