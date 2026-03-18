import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  // Global ignores
  {
    ignores: ["node_modules", "dist", ".env", "coverage", "*.log"],
  },
  // ESLint recommended rules
  eslint.configs.recommended,
  // TypeScript rules
  ...tseslint.configs.recommended,
  // Main config for source files
  {
    files: ["src/**/*.{ts,js}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
        sourceType: "module",
        ecmaVersion: 2021,
      },
      globals: {
        // Node.js globals
        global: "readonly",
        process: "readonly",
        Buffer: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
  },
];
