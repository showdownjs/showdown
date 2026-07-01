// Vite/Vitest virtual module `virtual:showdown` — lets tests run against the live src/ tree
// with NO build artifact. It concatenates the src files (same fixed, sorted order as the real
// build) in-memory and wraps them in the build's IIFE, invoked with `.call(globalThis)`.
//
// Why `.call(globalThis)`: helpers.js picks the DOM via `this` (this.document / this.window).
// Under the jsdom test environment, globalThis already has window+document, so this branch
// uses them directly and never hits the Node-only `require('jsdom')` fallback (which would
// fail in the ESM/browser test context).
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
      return `(function () {\n${body}\nglobalThis.__showdownSrc = showdown;\n}).call(globalThis);\nexport default globalThis.__showdownSrc;\n`;
    },
    // Re-run tests when any src file changes (watch mode).
    configureServer (server) {
      for (const f of sourceFiles()) { server.watcher.add(f); }
    }
  };
}
