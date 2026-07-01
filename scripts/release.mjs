// Interactive release task.  Run: npm run release   (dry run: npm run release -- --dry-run)
//
//   1. lint
//   2. build (pre-flight validation)
//   3. all tests (node suite + each browser engine)
//   4. performance
//   5. prompt for the new version
//   6. regenerate the changelog (after bumping + rebuilding with the new version)
//   7. commit, tag the version, and push
//   8. prompt whether to publish to npm, and publish if confirmed
//
// The release ALWAYS lands on master: steps 1-4 validate the current branch, then the work is
// merged into master and the release commit/tag are made there. Any failing step aborts the
// whole release (guarded). The working branch is synced back to master so they don't diverge.
//
// --dry-run: runs the real validation (1-4) but only PRINTS every state-changing step
// (checkout/merge/bump/rebuild/changelog/commit/tag/push/publish) instead of doing it. It does
// not require a clean tree and restores only the generated artifacts (dist/bin/perf) at the end,
// so nothing else in the working tree is touched.

import { execSync } from 'node:child_process';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import fs from 'node:fs';
import path from 'node:path';
import { root } from './concat.mjs';

const DRY = process.argv.includes('--dry-run');
// Children don't read our stdin, so validation tools can't swallow the prompt answers.
const CHILD_STDIO = ['ignore', 'inherit', 'inherit'];
// Generated files that the validation steps (build/perf) touch — restored after a dry run.
const ARTIFACTS = ['dist', 'bin', 'performance.json', 'performance.log.md'];

let step = 'startup';
const mark = label => { step = label; };
// Validation / read-only steps — always executed.
const run = (label, cmd) => {
  mark(label);
  console.log(`\n[${label}] $ ${cmd}`);
  execSync(cmd, { cwd: root, stdio: CHILD_STDIO });
};
// State-changing steps — printed only in a dry run.
const mutate = (label, cmd) => {
  mark(label);
  if (DRY) { console.log(`\n[${label}] (dry-run) would run: ${cmd}`); return; }
  console.log(`\n[${label}] $ ${cmd}`);
  execSync(cmd, { cwd: root, stdio: CHILD_STDIO });
};
const capture = cmd => execSync(cmd, { cwd: root, encoding: 'utf8' }).trim();

const rl = createInterface({ input, output });
const ask = async q => (await rl.question(q)).trim();
const BROWSERS = ['chromium', 'firefox', 'webkit'];

try {
  if (DRY) { console.log('=== DRY RUN — no commit, tag, push, or npm publish will happen ==='); }

  // Guard: a real release needs a clean tree (so the commit contains only release artifacts).
  // A dry run commits nothing, so it doesn't require one.
  if (!DRY) {
    mark('clean tree check');
    const dirty = capture('git status --porcelain');
    if (dirty) { throw new Error('working tree is not clean — commit or stash first:\n' + dirty); }
  }

  const startBranch = capture('git rev-parse --abbrev-ref HEAD');

  // 1-4: validate the current branch before touching master.
  run('lint', 'npm run lint');
  run('build', 'npm run build');
  run('tests (node)', 'npx vitest run');
  for (const b of BROWSERS) { run(`tests (${b})`, `npm run test:browser -- --project ${b}`); }
  run('performance', 'npm run perf');

  // 5: version.
  mark('version prompt');
  const pkgPath = path.join(root, 'package.json');
  const current = JSON.parse(fs.readFileSync(pkgPath, 'utf8')).version;
  let version = '';
  while (!version) {
    const ans = await ask(`\nCurrent version is ${current}. New version to release? `);
    if (!/^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/.test(ans)) {
      console.log('Please enter a valid semver, e.g. 3.0.0-rc3');
      continue;
    }
    version = ans;
  }

  // Land on master (ALWAYS): bring the validated work over.
  mutate('checkout master', 'git checkout master');
  mutate('sync master with origin', 'git pull --ff-only origin master');
  if (startBranch !== 'master') { mutate(`merge ${startBranch} into master`, `git merge --no-edit ${startBranch}`); }

  // 6: bump, rebuild (new version banner), changelog.
  mark('bump version');
  if (DRY) {
    console.log(`\n[bump version] (dry-run) would bump ${current} -> ${version}`);
  } else {
    fs.writeFileSync(pkgPath, fs.readFileSync(pkgPath, 'utf8').replace(/("version":\s*")[^"]+(")/, `$1${version}$2`));
    console.log(`Bumped ${current} -> ${version}`);
  }
  mutate('rebuild', 'npm run build');
  mutate('changelog', 'npm run changelog');

  // 7: commit, tag, push master.
  mutate('stage', 'git add -A');
  mutate('commit', `git commit -m "chore(release): ${version}"`);
  mutate('tag', `git tag -a ${version} -m "${version}"`);
  mutate('push master', 'git push origin master');
  mutate('push tag', `git push origin ${version}`);

  // Keep the working branch in sync with the release commit.
  if (startBranch !== 'master') {
    mutate(`checkout ${startBranch}`, `git checkout ${startBranch}`);
    mutate(`merge master into ${startBranch}`, 'git merge --no-edit master');
    mutate(`push ${startBranch}`, `git push origin ${startBranch}`);
  }

  // 8: optional npm publish (prereleases go to the `next` dist-tag, not `latest`).
  mark('publish prompt');
  const publish = (await ask('\nPublish to npm? (y/N) ')).toLowerCase();
  if (publish === 'y' || publish === 'yes') {
    const cmd = `npm publish${version.includes('-') ? ' --tag next' : ''}`;
    if (DRY) {
      console.log(`\n[npm publish] (dry-run) would run: ${cmd}`);
    } else {
      mark('npm publish');
      console.log(`\n[npm publish] $ ${cmd}`);
      execSync(cmd, { cwd: root, stdio: 'inherit' }); // inherit stdin so npm can prompt for an OTP
      console.log(`\nPublished ${version} to npm${version.includes('-') ? ' (dist-tag: next)' : ''}.`);
    }
  } else {
    console.log('\nSkipped npm publish.');
  }

  if (DRY) {
    console.log(`\n=== DRY RUN complete — validation passed; the release of ${version} would proceed as shown above. ===`);
  } else {
    console.log(`\nRelease ${version} complete — tagged on master${startBranch !== 'master' ? `, synced back to ${startBranch}` : ''}.`);
  }
} catch (err) {
  console.error(`\n[X] ${DRY ? 'DRY RUN' : 'RELEASE'} ABORTED at step: ${step}`);
  console.error(String(err && err.message ? err.message : err));
  if (!DRY) {
    console.error('No further steps ran. If it failed after "checkout master", you may need to clean up the local branch/tag manually.');
  }
  process.exitCode = 1;
} finally {
  rl.close();
  if (DRY) {
    // Restore only the generated artifacts the validation steps rebuilt — never the whole tree.
    try {
      execSync(`git checkout -- ${ARTIFACTS.join(' ')}`, { cwd: root });
      console.log('(dry-run) restored generated artifacts.');
    } catch { /* nothing to restore */ }
  }
}
