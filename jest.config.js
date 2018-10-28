module.exports = {
  setupFiles: [
    '<rootDir>/test-setup.js',
  ],
  transform: {
    '^.+\\.(js|jsx)?$': 'babel-jest'
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/?(*.)(spec|test).{js,jsx,mjs}',
    '<rootDir>/src/**/?(*.)(spec|test).{js,jsx,mjs}',
  ],
  testPathIgnorePatterns: [
    '.gitignore'
  ]
};
