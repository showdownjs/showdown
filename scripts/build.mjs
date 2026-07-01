// Release build — replaces grunt concat:dist + uglify + endline.
//
// Emits (all LF):
//   dist/showdown.js         UMD, readable  (banner + IIFE.call(this) + loader.js export shim)
//   dist/showdown.min.js     UMD, minified  (+ .map)
//   dist/showdown.esm.js     ESM, readable  (+ .esm.min.js + maps)
//   bin/showdown.js          CLI, minified, shebang (deps stay external — not bundled)
//
// The src/ files are non-modular shared-scope concatenation (see scripts/concat.mjs); we
// replicate the concat-in-IIFE wrapper rather than letting esbuild "bundle" them.

import fs from 'node:fs';
import path from 'node:path';
import esbuild from 'esbuild';
import { concatSources, pkgVersion, buildDate, root } from './concat.mjs';

const version = pkgVersion();
const stamp = `showdown v ${version} - ${buildDate()}`;
const distBanner = `;/*! ${stamp} */\n(function(){\n`;
const distFooter = '}).call(this);\n';
const minBanner = `/*! ${stamp} */`;

const LF = s => s.replace(/\r\n/g, '\n');
const write = (rel, content) => {
  const abs = path.join(root, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, LF(content), 'utf8');
  console.log(`wrote ${rel}`);
};

const body = concatSources();

// --- UMD readable ---
const umd = distBanner + body + '\n' + distFooter;
write('dist/showdown.js', umd);

// --- UMD minified (+ map) ---
await esbuild.build({
  stdin: { contents: umd, sourcefile: 'showdown.js', loader: 'js' },
  outfile: path.join(root, 'dist/showdown.min.js'),
  minify: true,
  sourcemap: true,
  banner: { js: minBanner },
  legalComments: 'none',
  write: true,
});
console.log('wrote dist/showdown.min.js (+ .map)');

// --- ESM readable (+ minified, maps) ---
// Wrap the body (minus loader.js) in an IIFE invoked with a real `this` (globalThis) so
// helpers.js's `this`-based environment detection works, then export the namespace.
const esmBodyNoLoader = concatSources({ omitLoader: true });
const esm = `/*! ${stamp} */\nconst showdown = (function () {\n${esmBodyNoLoader}\nreturn showdown;\n}).call(globalThis);\nexport default showdown;\nexport { showdown };\n`;
write('dist/showdown.esm.js', esm);

await esbuild.build({
  stdin: { contents: esm, sourcefile: 'showdown.esm.js', loader: 'js' },
  outfile: path.join(root, 'dist/showdown.esm.min.js'),
  format: 'esm',
  minify: true,
  sourcemap: true,
  banner: { js: minBanner },
  legalComments: 'none',
  write: true,
  // helpers.js has a Node-only lazy `require('happy-dom')` branch, unreachable in the
  // browser/bundler context this ESM build targets (Node consumers resolve to the UMD via
  // the exports map).
  logOverride: { 'unsupported-require-call': 'silent' },
});
console.log('wrote dist/showdown.esm.min.js (+ .map)');

// --- CLI (shebang + minified cli.js; deps stay external) ---
await esbuild.build({
  entryPoints: [path.join(root, 'src/cli/cli.js')],
  outfile: path.join(root, 'bin/showdown.js'),
  bundle: false,
  minify: true,
  platform: 'node',
  format: 'cjs',
  banner: { js: '#!/usr/bin/env node' },
  legalComments: 'none',
  write: true,
});
console.log('wrote bin/showdown.js');
