// https://jestjs.io/docs/en/configuration.html

module.exports = {
  // automock: false,
  // browser: false,
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  // coverageReporters: [
  //   "json",
  //   "text",
  //   "lcov",
  //   "clover"
  // ],
  // globals: {},
  // moduleFileExtensions: [
  //   "js",
  //   "json",
  //   "jsx",
  //   "ts",
  //   "tsx",
  //   "node"
  // ],
  testEnvironment: "node",
  testMatch: [
    "**/tests/**/*.[jt]s?(x)",
    "**/__tests__/**/*.[jt]s?(x)",
    "**/?(*.)+(spec|test).[tj]s?(x)",
  ],
}
