import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts"],
    env: {
      // Provide a dummy DATABASE_URL so db.ts doesn't throw during import.
      // All DB calls are mocked in tests, so this value is never used.
      DATABASE_URL: "postgresql://test:test@localhost:5432/test_db",
      NODE_ENV: "test",
      JWT_SECRET: "test-secret",
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/**/*.ts"],
      exclude: [
        "src/**/*.test.ts",
        "src/index.ts",
        "src/app.ts",
        "src/handler.ts",
        "src/migrate.ts",
        "src/create-admin.ts",
      ],
    },
  },
});
