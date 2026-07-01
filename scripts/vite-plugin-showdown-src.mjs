// Vite/Vitest virtual module `virtual:showdown` — lets tests run against the live src/ tree
// with NO build artifact. It concatenates the src files (same fixed, sorted order as the real
// build) in-memory and wraps them in the build's IIFE, invoked with `.call(globalThis)`.
//
// helpers.js resolves the DOM lazily: an ambient window/document when one exists (the jsdom
// test environment, real browsers), otherwise `require('happy-dom')`. ESM modules have no
// `require`, so for Node-environment tests (no window) the generated module shims one via
// createRequire, anchored to the project root so happy-dom resolves from our node_modules.
// The shim is conditional at runtime — browser-mode runs never evaluate the node:module import.
//
// loader.js (the UMD export shim) is omitted — its `module.exports = showdown` branch trips
// over the read-only ES module namespace Vitest exposes. We expose the `showdown` binding
// directly instead.

import { sourceFiles, concatSources } from './concat.mjs';

const VIRTUAL_ID = 'virtual:showdown';
const RESOLVED_ID = '\0' + VIRTUAL_ID;

export default function showdownSrcPlugin () {
  return {
    name: 'showdown-src',
    resolveId (id) {
      if (id === VIRTUAL_ID) { return RESOLVED_ID; }
      return null;
    },
    load (id) {
      if (id !== RESOLVED_ID) { return null; }
      const body = concatSources({ omitLoader: true });
      const requireBase = JSON.stringify(new URL('../package.json', import.meta.url).href);
      return 'let require;\n' +
        'if (typeof window === \'undefined\') {\n' +
        '  const { createRequire } = await import(\'node:module\');\n' +
        `  require = createRequire(${requireBase});\n` +
        '}\n' +
        `(function () {\n${body}\nglobalThis.__showdownSrc = showdown;\n}).call(globalThis);\nexport default globalThis.__showdownSrc;\n`;
    },
    // Re-run tests when any src file changes (watch mode).
    configureServer (server) {
      for (const f of sourceFiles()) { server.watcher.add(f); }
    }
  };
}
