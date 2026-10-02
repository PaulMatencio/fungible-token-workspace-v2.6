import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@contract': path.resolve(__dirname, 'contract'),
      '@': path.resolve(__dirname, 'src')
    }
  },
  test: { environment: 'node', include: ['tests/**/*.test.ts'], testTimeout: 60_000 }
});
