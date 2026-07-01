import { defineConfig } from 'vitest/config';
import showdownSrc from './scripts/vite-plugin-showdown-src.mjs';

export default defineConfig({
  plugins: [showdownSrc()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/vitest.setup.mjs'],
    include: ['test/unit/**/*.js', 'test/functional/**/testsuite.*.js'],
    // The CLI suite spawns `node src/cli/cli.js` subprocesses; give it head room.
    testTimeout: 15000
  }
});
