// Interim test bundle — replaces `grunt concat:test`.
//
// Writes .build/showdown.js: the RAW concatenation of the src files (no banner, no IIFE
// wrapper, no sourcemap), exactly as grunt concat:test produced it. Required-in by the
// legacy Mocha bootstrap and loaded by Karma while those runners still exist (Phases 1-3).
// It is retired in Phase 4; library tests move to the in-memory `virtual:showdown` module.

import fs from 'node:fs';
import path from 'node:path';
import { concatSources, root } from './concat.mjs';

const outDir = path.join(root, '.build');
const outFile = path.join(outDir, 'showdown.js');

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, concatSources(), 'utf8');

// eslint-disable-next-line no-console
console.log(`wrote ${path.relative(root, outFile)}`);
