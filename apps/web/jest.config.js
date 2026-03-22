// eslint-disable-next-line @typescript-eslint/no-require-imports
const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // next.config.ts and .env files directory
  dir: "./",
});

/** @type {import('jest').Config} */
const config = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^next-intl$": "<rootDir>/__mocks__/next-intl.js",
    "^next-auth/react$": "<rootDir>/__mocks__/next-auth-react.js",
  },
  transformIgnorePatterns: ["node_modules/(?!(next-intl|next-auth|lucide-react)/)"],
  testMatch: ["**/__tests__/**/*.{test,spec}.{ts,tsx,js,jsx}"],
  collectCoverageFrom: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./utils/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
  ],
  coverageDirectory: "coverage",
};

module.exports = createJestConfig(config);
