import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import showdownSrc from './scripts/vite-plugin-showdown-src.mjs';

// Browser test run — the DOM-facing unit specs (formerly the Karma matrix) executed in real
// engines via Vitest browser mode (Playwright). Only test/unit/showdown*.js run here; the CLI
// and fs-based functional suites stay in the Node (jsdom) project.
export default defineConfig({
  plugins: [showdownSrc()],
  test: {
    globals: true,
    setupFiles: ['./test/vitest.setup.mjs'],
    include: ['test/unit/showdown*.js'],
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      instances: [
        { browser: 'chromium' },
        { browser: 'firefox' },
        { browser: 'webkit' }
      ]
    }
  }
});
