// Minimal Vitest setup — replaces the old test/bootstrap.js + optionswp.js.
//
// The library under test comes from the in-memory `virtual:showdown` module (the live src/
// tree, no build artifact). `expect`/`describe`/`it` are Vitest globals (globals: true).
// `getDefaultOpts` is gone — the one test that used it now calls the public
// `showdown.getDefaultOptions()` API instead.

import { beforeAll, afterAll } from 'vitest';
import showdown from 'virtual:showdown';

globalThis.showdown = showdown;

// Mocha's suite-level hooks aren't Vitest globals — alias them to the equivalents.
globalThis.before = beforeAll;
globalThis.after = afterAll;
