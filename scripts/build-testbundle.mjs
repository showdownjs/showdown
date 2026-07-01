// Interim test bundle — replaces `grunt concat:test`.
//
// Writes .build/showdown.js: the RAW concatenation of the src files (no banner, no IIFE
// wrapper, no sourcemap), exactly as grunt concat:test produced it. Required-in by the
// legacy Mocha bootstrap and loaded by Karma while those runners still exist (Phases 1-3).
// It is retired in Phase 4; library tests move to the in-memory `virtual:showdown` module.

import fs from 'node:fs';
import path from 'node:path';
import { concatSources, root } from './concat.mjs';

// Default output is .build/showdown.js; an explicit path arg lets callers (e.g. the CLI test)
// concat into a throwaway location instead.
const outFile = process.argv[2] ? path.resolve(process.argv[2]) : path.join(root, '.build', 'showdown.js');

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, concatSources(), 'utf8');

console.log(`wrote ${path.relative(root, outFile)}`);
