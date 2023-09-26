import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './setupTests.ts',
    coverage: {
      all: true,
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: [
        '**/__mocks__/**/*.{tsx,ts}',
        '**/__tests__/**/*.{tsx,ts}',
        '**/*.d.ts',
        '**/*.test.{tsx,ts}',
      ],
      statements: 6,
      branches: 24,
      functions: 8,
      lines: 6,
      reporter: ['text', 'json-summary', 'html', 'json'],
    },
  },
});
