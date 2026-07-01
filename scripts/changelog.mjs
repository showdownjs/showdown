// Generate the changelog for the current (unreleased) version and prepend it to CHANGELOG.md.
//
// conventional-changelog's own `-s -i` prepend leaves NO separator between the new section and
// the previous one, jamming the new release's last bullet against the old version header. This
// wrapper instead:
//   - collapses internal blank-line runs to a single blank line (repo style: one blank after
//     the version header), and
//   - separates the new section from the existing content by exactly two blank lines.
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { root } from './concat.mjs';

const file = path.join(root, 'CHANGELOG.md');
const raw = execSync('npx conventional-changelog -p angular', { encoding: 'utf8', cwd: root }).trim();

if (!raw) {
  console.log('changelog: no unreleased commits — nothing to add');
} else {
  const section = raw.replace(/\n{3,}/g, '\n\n');
  const existing = fs.existsSync(file) ? fs.readFileSync(file, 'utf8').replace(/^\s+/, '') : '';
  const out = (existing ? `${section}\n\n\n${existing}` : section).replace(/\s*$/, '') + '\n';
  fs.writeFileSync(file, out, 'utf8');
  console.log('changelog: prepended new release section (2 blank lines before the previous)');
}
