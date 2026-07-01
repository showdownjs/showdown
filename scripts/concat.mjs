// Shared source concatenation for the showdown build.
//
// The src/ files are NOT ES modules: they are concatenated in a fixed order and share one
// lexical scope (a single `showdown` identifier, hoisted `getDefaultOpts`, etc.). Order
// matters, and the two subParser globs MUST be sorted deterministically — readdir order is
// not guaranteed across platforms/filesystems, and a different order changes the output.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Fixed concat order, mirroring the former Gruntfile concat.dist.src.
const ORDER = [
  'src/options.js',
  'src/showdown.js',
  'src/helpers.js',
  'src/event.js',
  'src/subParsers/makehtml',   // directory glob (sorted)
  'src/subParsers/makemarkdown', // directory glob (sorted)
  'src/converter.js',
  'src/loader.js'
];

/** Resolve ORDER into an explicit, deterministic list of absolute file paths. */
export function sourceFiles () {
  const files = [];
  for (const entry of ORDER) {
    const abs = path.join(root, entry);
    if (fs.existsSync(abs) && fs.statSync(abs).isDirectory()) {
      const dirFiles = fs.readdirSync(abs)
        .filter(f => f.endsWith('.js'))
        .sort(); // deterministic — do NOT rely on readdir order
      for (const f of dirFiles) { files.push(path.join(abs, f)); }
    } else {
      files.push(abs);
    }
  }
  return files;
}

/**
 * Concatenate the sources (LF-joined, LF-normalized). `omitLoader` drops src/loader.js
 * (the UMD export shim) so callers can supply their own export epilogue (e.g. an ESM build).
 */
export function concatSources ({ omitLoader = false } = {}) {
  const loader = path.join(root, 'src/loader.js');
  const files = sourceFiles().filter(f => !(omitLoader && f === loader));
  const parts = files.map(f => fs.readFileSync(f, 'utf8').replace(/\r\n/g, '\n'));
  return parts.join('\n');
}

export function pkgVersion () {
  return JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version;
}

/** dd-mm-yyyy, matching the former grunt.template.today('dd-mm-yyyy') banner. */
export function buildDate (d = new Date()) {
  const pad = n => String(n).padStart(2, '0');
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;
}

export { root };
