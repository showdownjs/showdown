// Regenerate the CommonMark test fixture — replaces the grunt `extract-commonmark-tests`
// task. Extracts the spec examples from the commonmark-spec package into a JSON fixture the
// functional suite consumes.

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { root } from './concat.mjs';

const require = createRequire(import.meta.url);
const commonmark = require('commonmark-spec');

const out = path.join(root, 'test/functional/makehtml/cases/commonmark.testsuite.json');
fs.writeFileSync(out, JSON.stringify(commonmark.tests, null, 2), 'utf8');

// eslint-disable-next-line no-console
console.log(`wrote ${path.relative(root, out)} (${commonmark.tests.length} examples)`);
