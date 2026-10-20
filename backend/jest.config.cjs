/** Jest en ESM nativo (package.json "type": "module"): sin transformaciones. */
module.exports = {
  testEnvironment: 'node',
  transform: {},
  setupFiles: ['<rootDir>/tests/setup/env.js'],
  testMatch: ['**/tests/**/*.test.js'],
  coveragePathIgnorePatterns: ['/node_modules/'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/infrastructure/database/models/index.js',
  ],
  // Sin umbral al inicio; subirlo cuando haya suficiente cobertura.
};
