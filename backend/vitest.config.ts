import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // Isolate test DB from dev DB
    env: {
      DB_PATH: '/tmp/pcrj-test.db',
      JWT_SECRET: 'test-secret-key',
    },
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/server.ts', 'src/**/*.d.ts'],
    },
  },
})
