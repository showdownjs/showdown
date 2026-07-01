// Interactive release task.  Run: npm run release
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
// whole release (guarded — nothing past the failure runs). The working branch is synced back
// to master at the end so the two don't diverge.

import { execSync } from 'node:child_process';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import fs from 'node:fs';
import path from 'node:path';
import { root } from './concat.mjs';

let step = 'startup';
const mark = label => { step = label; };
const run = (label, cmd) => {
  mark(label);
  console.log(`\n[${label}] $ ${cmd}`);
  execSync(cmd, { cwd: root, stdio: 'inherit' });
};
const capture = cmd => execSync(cmd, { cwd: root, encoding: 'utf8' }).trim();

const rl = createInterface({ input, output });
const ask = async q => (await rl.question(q)).trim();
const BROWSERS = ['chromium', 'firefox', 'webkit'];

try {
  // Guard: a clean tree keeps the release commit limited to release artifacts.
  mark('clean tree check');
  const dirty = capture('git status --porcelain');
  if (dirty) { throw new Error('working tree is not clean — commit or stash first:\n' + dirty); }

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
  run('checkout master', 'git checkout master');
  run('sync master with origin', 'git pull --ff-only origin master');
  if (startBranch !== 'master') { run(`merge ${startBranch} into master`, `git merge --no-edit ${startBranch}`); }

  // 6: bump, rebuild (new version banner), changelog — all on master.
  mark('bump version');
  fs.writeFileSync(pkgPath, fs.readFileSync(pkgPath, 'utf8').replace(/("version":\s*")[^"]+(")/, `$1${version}$2`));
  console.log(`Bumped ${current} -> ${version}`);
  run('rebuild', 'npm run build');
  run('changelog', 'npm run changelog');

  // 7: commit, tag, push master.
  run('stage', 'git add -A');
  run('commit', `git commit -m "chore(release): ${version}"`);
  run('tag', `git tag -a ${version} -m "${version}"`);
  run('push master', 'git push origin master');
  run('push tag', `git push origin ${version}`);

  // Keep the working branch in sync with the release commit.
  if (startBranch !== 'master') {
    run(`checkout ${startBranch}`, `git checkout ${startBranch}`);
    run(`merge master into ${startBranch}`, 'git merge --no-edit master');
    run(`push ${startBranch}`, `git push origin ${startBranch}`);
  }

  // 8: optional npm publish (prereleases go to the `next` dist-tag, not `latest`).
  mark('publish prompt');
  const publish = (await ask('\nPublish to npm? (y/N) ')).toLowerCase();
  if (publish === 'y' || publish === 'yes') {
    const isPrerelease = version.includes('-');
    run('npm publish', `npm publish${isPrerelease ? ' --tag next' : ''}`);
    console.log(`\nPublished ${version} to npm${isPrerelease ? ' (dist-tag: next)' : ''}.`);
  } else {
    console.log('\nSkipped npm publish.');
  }

  console.log(`\nRelease ${version} complete — tagged on master${startBranch !== 'master' ? `, synced back to ${startBranch}` : ''}.`);
} catch (err) {
  console.error(`\n✗ RELEASE ABORTED at step: ${step}`);
  console.error(String(err && err.message ? err.message : err));
  console.error('No further steps ran. If it failed after "checkout master", you may need to clean up the local branch/tag manually.');
  process.exitCode = 1;
} finally {
  rl.close();
}
