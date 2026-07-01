let fs = require('fs'),
    os = require('os'),
    path = require('path'),
    execFileSync = require('child_process').execFileSync,
    spawnSync = require('child_process').spawnSync,
    packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

/**
 * Spawns a CLI process synchrously
 * @param {string|null} command
 * @param {string[]} args
 * @param {{}} [options]
 * @returns {{output: *, stdout: string, stderr: string, status: number}}
 */
function spawnCLI (command, args, options) {
  'use strict';
  let nargs = ['src/cli/cli.js'];
  if (command) { nargs.push(command);}
  args = nargs.concat(args);
  options = options || {};
  // Spawn with a deterministic, color-free base environment. Some runners (notably IDE
  // test runners) export FORCE_COLOR, which the child would otherwise inherit and emit
  // ANSI codes the assertions don't expect. Stripping it here keeps output stable wherever
  // the suite runs. A test that needs a specific value (e.g. NO_COLOR) sets it through
  // options.env, which is layered on top and therefore wins.
  let env = {};
  Object.keys(process.env).forEach(function (key) {
    if (key !== 'FORCE_COLOR' && key !== 'NO_COLOR') {
      env[key] = process.env[key];
    }
  });
  if (options.env) {
    Object.keys(options.env).forEach(function (key) { env[key] = options.env[key]; });
  }
  options.env = env;
  let otp = spawnSync('node', args, options),
      stdout = otp.stdout.toString(),
      stderr = otp.stderr.toString(),
      output = otp.output[0],
      status = otp.status;

  return {stdout: stdout, stderr: stderr, output: output, status: status};
}

describe('showdown cli', function () {
  'use strict';

  // (spawn timeout is set globally via testTimeout in vitest.config.mjs)

  // File-output tests get their own throwaway directory. We also build a fresh showdown
  // bundle into it and point the spawned CLI at it via SHOWDOWN_CLI_BUNDLE, so the tests
  // exercise the current src/ rather than a possibly-stale committed dist.
  let tmpDir;
  before(function () {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'showdown-cli-'));
    let bundlePath = path.join(tmpDir, 'showdown.js');
    execFileSync(process.execPath, [path.resolve('scripts/build-testbundle.mjs'), bundlePath]);
    process.env.SHOWDOWN_CLI_BUNDLE = bundlePath;
    // The bundle lives outside the project tree, so its lazy `require('happy-dom')` (hit by
    // the makemarkdown tests) needs NODE_PATH to resolve the project's node_modules.
    process.env.NODE_PATH = path.resolve('node_modules');
  });
  after(function () {
    delete process.env.SHOWDOWN_CLI_BUNDLE;
    delete process.env.NODE_PATH;
    if (tmpDir) { fs.rmSync(tmpDir, {recursive: true, force: true}); }
  });
  function tmp (name) {
    return path.join(tmpDir, name);
  }

  describe('without commands', function () {

    it('should display help if no commands are specified', function () {
      let proc = spawnCLI(null, [], {});
      expect(proc.status).toBe(1);
      expect(proc.stderr).toContain('CLI to Showdownjs markdown parser');
      expect(proc.stderr).toContain('Usage:');
      expect(proc.stderr).toContain('Options:');
      expect(proc.stderr).toContain('Commands:');
      expect(proc.stdout).toBe('');
    });

    describe('-h', function () {
      it('should display help', function () {
        let proc = spawnCLI(null, ['-h'], {});
        expect(proc.status).toBe(0);
        expect(proc.stdout).toContain('CLI to Showdownjs markdown parser');
        expect(proc.stdout).toContain('Usage:');
        expect(proc.stdout).toContain('Options:');
        expect(proc.stdout).toContain('Commands:');
        expect(proc.stderr).toBe('');
      });
    });

    describe('-v', function () {
      it('should display version', function () {
        let proc = spawnCLI(null, ['-V'], {}),
            verRegex = /^(\d{1,2}\.\d{1,3}\.\d{1,3}(?:-(?:alpha|beta|rc)\d{0,2})?)/;
        expect(proc.status).toBe(0);
        expect(proc.stdout).toMatch(verRegex);
        expect(verRegex.exec(proc.stdout)[0]).toBe(packageJson.version);
        expect(proc.stderr).toBe('');
      });
    });
  });

  describe('makehtml command', function () {

    describe('makehtml without flags', function () {
      it('should read from stdin and output to stdout', function () {
        let proc = spawnCLI('makehtml', [], {
          input: '**foo**',
          encoding: 'utf-8'
        });
        expect(proc.status).toBe(0);
        expect(proc.stdout.trim()).toBe('<p><strong>foo</strong></p>');
        expect(proc.stderr).not.toBe('');
      });
    });

    describe('makehtml -p', function () {

      it('should enable a flavor', function () {
        let proc = spawnCLI('makehtml', ['-p', 'gfm'], {
          input: 'this is a :smile:', // test the emoji option as a proxy
          encoding: 'utf-8'
        });
        expect(proc.status).toBe(0);
        expect(proc.stderr).toContain('Enabling flavor gfm...');
        expect(proc.stdout.trim()).toBe('<p>this is a 😄</p>');
        //'Here in London'.should.match(/(here|there) in (\w+)/i).and.capture(1).equals('London');
      });

      it('should give an error if a flavor is not recognised', function () {
        let proc = spawnCLI('makehtml', ['-p', 'foobar'], {
          input: '**foo**',
          encoding: 'utf-8'
        });
        expect(proc.status).toBe(1);
      });

      it('should list the available flavors in the error of an unrecognised flavor', function () {
        let proc = spawnCLI('makehtml', ['-p', 'foobar'], {
          input: '**foo**',
          encoding: 'utf-8'
        });
        expect(proc.status).toBe(1);
        expect(proc.stderr).toContain('Available flavors:');
        expect(proc.stderr).toContain('vanilla');
      });
    });

    describe('makehtml --list-flavors', function () {
      it('should list the available flavors and exit cleanly', function () {
        let proc = spawnCLI('makehtml', ['--list-flavors'], {encoding: 'utf-8'});
        expect(proc.status).toBe(0);
        expect(proc.stdout).toContain('Available flavors:');
        expect(proc.stdout).toContain('gfm');
        expect(proc.stdout).toContain('commonmark');
        expect(proc.stdout).toContain('vanilla');
      });
    });

    describe('makehtml -c', function () {
      it('should not parse emoji if config option is not passed', function () {
        let proc = spawnCLI('makehtml', [], {
          input: 'this is a :smile:',
          encoding: 'utf-8'
        });
        expect(proc.status).toBe(0);
        expect(proc.stderr).not.toContain('Enabling option emoji');
        expect(proc.stdout.trim()).toBe('<p>this is a :smile:</p>');
      });

      it('should enable a showdown option', function () {
        let proc = spawnCLI('makehtml', ['-c', 'emoji'], {
          input: 'this is a :smile:',
          encoding: 'utf-8'
        });
        expect(proc.status).toBe(0);
        expect(proc.stderr).toContain('Enabling option emoji');
        expect(proc.stdout.trim()).toBe('<p>this is a 😄</p>');
      });

      it('should warn and skip unrecognized options', function () {
        let proc = spawnCLI('makehtml', ['-c', 'foobar'], {
          input: 'foo',
          encoding: 'utf-8'
        });
        expect(proc.status).toBe(0);
        expect(proc.stderr).toContain('unknown option \'foobar\'');
        expect(proc.stderr).not.toContain('Enabling option foobar');
        expect(proc.stdout.trim()).toBe('<p>foo</p>');
      });

      it('should coerce a numeric option', function () {
        let proc = spawnCLI('makehtml', ['-c', 'headerLevelStart=3'], {
          input: '# hi',
          encoding: 'utf-8'
        });
        expect(proc.status).toBe(0);
        expect(proc.stdout).toMatch(/^<h3\b/);
      });

      it('should enable a boolean option passed as =true', function () {
        let proc = spawnCLI('makehtml', ['-c', 'emoji=true'], {
          input: 'this is a :smile:',
          encoding: 'utf-8'
        });
        expect(proc.status).toBe(0);
        expect(proc.stdout.trim()).toBe('<p>this is a 😄</p>');
      });

      it('should disable a boolean option passed as =false', function () {
        let proc = spawnCLI('makehtml', ['-c', 'emoji=false'], {
          input: 'this is a :smile:',
          encoding: 'utf-8'
        });
        expect(proc.status).toBe(0);
        expect(proc.stdout.trim()).toBe('<p>this is a :smile:</p>');
      });

      it('should let -c disable an option enabled by a flavor', function () {
        let proc = spawnCLI('makehtml', ['-p', 'gfm', '-c', 'tables=false'], {
          input: 'a | b\n- | -\n1 | 2',
          encoding: 'utf-8'
        });
        expect(proc.status).toBe(0);
        expect(proc.stdout).not.toContain('<table');
      });

      it('should warn on an invalid boolean value', function () {
        let proc = spawnCLI('makehtml', ['-c', 'emoji=notabool'], {
          input: 'this is a :smile:',
          encoding: 'utf-8'
        });
        expect(proc.status).toBe(0);
        expect(proc.stderr).toContain('invalid boolean value');
        expect(proc.stdout.trim()).toBe('<p>this is a :smile:</p>');
      });

    });

    describe('makehtml -m', function () {

      it('should mute information', function () {
        let proc = spawnCLI('makehtml', ['-m', '-i'], {input: '**foo**'});
        expect(proc.status).toBe(0);
        expect(proc.output).toBeNull(); expect(// jshint ignore:line
          proc.stdout.trim()).toBe('<p><strong>foo</strong></p>');
        expect(proc.stderr).toBe('');
      });

      it('should mute everything, even errors', function () {
        let proc = spawnCLI('makehtml', ['-m', '-i']);
        //proc.status.should.equal(0);
        expect(proc.output).toBeNull(); expect(// jshint ignore:line
          proc.stdout).toBe('');
        expect(proc.stderr).toBe('');
      });

      it('should not mute parsed html', function () {
        let proc = spawnCLI('makehtml', ['-m', '-i'], {
          input: '**foo**',
          encoding: 'utf-8'
        });
        expect(proc.status).toBe(0);
        expect(proc.stdout.trim()).toBe('<p><strong>foo</strong></p>');
        expect(proc.stderr).toBe('');
      });
    });

    describe('makehtml -q', function () {

      it('should not display information', function () {
        let proc = spawnCLI('makehtml', ['-q', '-i'], {input: '**foo**'});
        expect(proc.status).toBe(0);
        expect(proc.output).toBeNull(); expect(// jshint ignore:line
          proc.stdout.trim()).toBe('<p><strong>foo</strong></p>');
        expect(proc.stderr).toMatch(/^\s*DONE!\s*$/);
      });

      it('should display errors', function () {
        let proc = spawnCLI('makehtml', ['-q', '-i', '-e', 'foo'], {input: 'f'});
        expect(proc.status).toBe(1);
        expect(proc.output).toBeNull(); expect(// jshint ignore:line
          proc.stdout).toBe('');
        expect(proc.stderr).toMatch(/^ERROR:/);
      });

      it('should not mute parsed html', function () {
        let proc = spawnCLI('makehtml', ['-q', '-i'], {
          input: '**foo**',
          encoding: 'utf-8'
        });
        expect(proc.status).toBe(0);
        expect(proc.stdout.trim()).toBe('<p><strong>foo</strong></p>');
        expect(proc.stderr).toMatch(/^\s*DONE!\s*$/);
      });
    });

    describe('makehtml -i -o', function () {
      it('should read from stdin and output to stdout', function () {
        let proc = spawnCLI('makehtml', ['-i', '-o'], {
          input: '**foo**',
          encoding: 'utf-8'
        });
        expect(proc.status).toBe(0);
        expect(proc.stdout.trim()).toBe('<p><strong>foo</strong></p>');
        expect(proc.stderr).not.toBe('');
      });
    });

    describe('makehtml -i <file> -o', function () {
      it('should read from a file and output to stdout', function () {
        let expectedOtp = fs.readFileSync('test/cli/basic.html', 'utf8').toString().trim(),
            proc = spawnCLI('makehtml', ['-i', 'test/cli/basic.md'], {encoding: 'utf-8'});

        expect(proc.status).toBe(0);
        expect(proc.stdout.trim()).toBe(expectedOtp);
        expect(proc.stderr).not.toBe('');
      });
    });

    describe('makehtml -i -o <file>', function () {
      it('should read from stdin and output to a file', function () {
        let out = tmp('io1.html'),
            proc = spawnCLI('makehtml', ['-m', '-i', '-o', out], {
              encoding: 'utf8',
              input: '**foo**'
            });
        expect(proc.status).toBe(0, proc.stderr);
        expect(fs.readFileSync(out, 'utf8').trim()).toBe('<p><strong>foo</strong></p>');
      });
    });

    describe('makehtml -i <file> -o <file>', function () {
      it('should read from a file and output to a file', function () {
        let out = tmp('io2.html'),
            expectedOtp = fs.readFileSync('test/cli/basic.html', 'utf8').toString().trim(),
            proc = spawnCLI('makehtml', ['-i', 'test/cli/basic.md', '-o', out], {encoding: 'utf-8'});

        expect(proc.status).toBe(0, proc.stderr);
        expect(proc.stderr).toBe('');
        expect(fs.readFileSync(out, 'utf8').trim()).toBe(expectedOtp);
        expect(proc.stdout).not.toBe(expectedOtp);
      });
    });

    describe('makehtml -a', function () {
      it('should read from stdin and append to a file', function () {
        let out = tmp('io3.html');
        fs.writeFileSync(out, '<p>foo</p>');

        let expectedOtp = '<p>foo</p><p><strong>foo</strong></p>',
            proc = spawnCLI('makehtml', ['-i', '-o', out, '-a'], {
              encoding: 'utf8',
              input: '**foo**'
            });

        expect(proc.status).toBe(0, proc.stderr);
        expect(// stderr should be empty
          proc.stderr).toBe('');
        expect(fs.readFileSync(out, 'utf8').trim()).toBe(expectedOtp);
        expect(// since the output is to a file, messages are logged to stdout
          proc.stdout).not.toBe(expectedOtp);
      });

      it('should ignore -a flag if -o <file> is missing', function () {

        let expectedOtp = '<p><strong>foo</strong></p>',
            proc = spawnCLI('makehtml', ['-a'], {encoding: 'utf8', input: '**foo**'});
        expect(proc.status).toBe(0);
        expect(proc.stderr).not.toBe('');
        expect(proc.stdout.trim()).toBe(expectedOtp);
      });
    });

    describe('makehtml -e', function () {
      it('should load the extension', function () {
        let expectedOtp = '<p><strong>bar</strong></p>',
            extPath = path.resolve(__dirname + '/../mocks/mock-extension.js'),
            proc = spawnCLI('makehtml', ['-i', '-o', '-e', extPath], {
              encoding: 'utf8',
              input: '**foo**'
            });
        expect(proc.status).toBe(0, 'Process exited with error state');
        expect(proc.stdout.trim()).toBe(expectedOtp);
      });

      it('should resolve a relative extension path against the cwd', function () {
        let expectedOtp = '<p><strong>bar</strong></p>',
            relPath = './' + path.relative(process.cwd(), path.resolve(__dirname + '/../mocks/mock-extension.js')).replace(/\\/g, '/'),
            proc = spawnCLI('makehtml', ['-i', '-o', '-e', relPath], {
              encoding: 'utf8',
              input: '**foo**'
            });
        expect(proc.status).toBe(0, 'Process exited with error state');
        expect(proc.stdout.trim()).toBe(expectedOtp);
      });
    });

    describe('makehtml -y', function () {
      it('should write the output using the requested encoding', function () {
        let out = tmp('enc.html'),
            proc = spawnCLI('makehtml', ['-m', '-i', '-o', out, '-y', 'latin1'], {
              encoding: 'utf8',
              input: '# café'
            });
        expect(proc.status).toBe(0, proc.stderr);
        let buf = fs.readFileSync(out);
        expect(// latin1 encodes é as a single 0xE9 byte; utf8 would be 0xC3 0xA9
          buf.includes(0xe9)).toBe(true);
        expect(buf.includes(0xc3)).toBe(false);
      });
    });

    describe('makehtml newline handling', function () {
      it('should append a trailing newline when writing to stdout', function () {
        let proc = spawnCLI('makehtml', [], {input: '**foo**', encoding: 'utf-8'});
        expect(proc.status).toBe(0);
        expect(proc.stdout).toBe('<p><strong>foo</strong></p>\n');
      });

      it('should not append a trailing newline when writing to a file', function () {
        let out = tmp('nl.html'),
            proc = spawnCLI('makehtml', ['-m', '-i', '-o', out], {
              encoding: 'utf8',
              input: '**foo**'
            });
        expect(proc.status).toBe(0, proc.stderr);
        expect(fs.readFileSync(out, 'utf8')).toBe('<p><strong>foo</strong></p>');
      });
    });

    describe('makehtml batch / glob input', function () {
      let dir = '.build/batch';

      beforeEach(function () {
        fs.rmSync(dir, {recursive: true, force: true});
        fs.mkdirSync(dir + '/out', {recursive: true});
        fs.writeFileSync(dir + '/a.md', '# A');
        fs.writeFileSync(dir + '/b.md', '# B');
      });

      it('should convert multiple inputs into an output directory', function () {
        let proc = spawnCLI('makehtml', ['-m', '-i', dir + '/a.md', dir + '/b.md', '-o', dir + '/out'], {encoding: 'utf8'});
        expect(proc.status).toBe(0);
        expect(fs.readFileSync(dir + '/out/a.html', 'utf8')).toContain('>A<');
        expect(fs.readFileSync(dir + '/out/b.html', 'utf8')).toContain('>B<');
      });

      it('should write outputs beside each source when no output is given', function () {
        let proc = spawnCLI('makehtml', ['-m', '-i', dir + '/a.md', dir + '/b.md'], {encoding: 'utf8'});
        expect(proc.status).toBe(0);
        expect(fs.existsSync(dir + '/a.html')).toBe(true);
        expect(fs.existsSync(dir + '/b.html')).toBe(true);
      });

      it('should expand a glob pattern with the built-in matcher', function () {
        // quote-free single arg so the shell does not pre-expand it on POSIX
        let proc = spawnCLI('makehtml', ['-m', '-i', dir + '/*.md', '-o', dir + '/out'], {encoding: 'utf8'});
        expect(proc.status).toBe(0);
        expect(fs.existsSync(dir + '/out/a.html')).toBe(true);
        expect(fs.existsSync(dir + '/out/b.html')).toBe(true);
      });

      it('should reject a single output file for multiple inputs', function () {
        let proc = spawnCLI('makehtml', ['-i', dir + '/a.md', dir + '/b.md', '-o', dir + '/one.html'], {encoding: 'utf8'});
        expect(proc.status).toBe(1);
        expect(proc.stderr).toContain('directory');
      });

      it('should error when a glob matches nothing', function () {
        let proc = spawnCLI('makehtml', ['-i', dir + '/*.nomatch'], {encoding: 'utf8'});
        expect(proc.status).toBe(1);
        expect(proc.stderr).toContain('no files matched');
      });

      it('should create the output directory when it does not exist', function () {
        let proc = spawnCLI('makehtml', ['-m', '-i', dir + '/a.md', dir + '/b.md', '-o', dir + '/new/'], {encoding: 'utf8'});
        expect(proc.status).toBe(0);
        expect(fs.existsSync(dir + '/new/a.html')).toBe(true);
        expect(fs.existsSync(dir + '/new/b.html')).toBe(true);
      });

      it('should treat a single -o with a trailing slash as a directory', function () {
        let proc = spawnCLI('makehtml', ['-m', '-i', dir + '/a.md', '-o', dir + '/single/'], {encoding: 'utf8'});
        expect(proc.status).toBe(0);
        expect(fs.existsSync(dir + '/single/a.html')).toBe(true);
      });

      it('should explain that recursive globs are unsupported', function () {
        let proc = spawnCLI('makehtml', ['-i', dir + '/**/*.md'], {encoding: 'utf8'});
        expect(proc.status).toBe(1);
        expect(proc.stderr).toContain('recursive');
      });

      it('should give a clear error when the input is a directory', function () {
        let proc = spawnCLI('makehtml', ['-i', dir], {encoding: 'utf8'});
        expect(proc.status).toBe(1);
        expect(proc.stderr).toContain('is a directory');
      });
    });

    describe('makehtml -v', function () {
      it('should print extra information in verbose mode', function () {
        let proc = spawnCLI('makehtml', ['-v', '-i'], {input: '**foo**', encoding: 'utf-8'});
        expect(proc.status).toBe(0);
        expect(proc.stderr).toContain('bytes from stdin');
        expect(proc.stdout.trim()).toBe('<p><strong>foo</strong></p>');
      });

      it('should not print the extra information without -v', function () {
        let proc = spawnCLI('makehtml', ['-i'], {input: '**foo**', encoding: 'utf-8'});
        expect(proc.status).toBe(0);
        expect(proc.stderr).not.toContain('bytes from stdin');
      });
    });

    describe('makehtml color', function () {
      let ESC = String.fromCharCode(27) + '[';

      it('should not emit ANSI codes by default when piped', function () {
        let proc = spawnCLI('makehtml', ['-c', 'bogus'], {input: 'foo', encoding: 'utf-8'});
        expect(proc.stderr).not.toContain(ESC);
      });

      it('should emit ANSI codes with --color', function () {
        let proc = spawnCLI('makehtml', ['--color', '-c', 'bogus'], {input: 'foo', encoding: 'utf-8'});
        expect(proc.stderr).toContain(ESC);
      });

      it('should not emit ANSI codes with --no-color', function () {
        let proc = spawnCLI('makehtml', ['--no-color', '-c', 'bogus'], {input: 'foo', encoding: 'utf-8'});
        expect(proc.stderr).not.toContain(ESC);
      });

      it('should honor the NO_COLOR environment letiable', function () {
        // spawnCLI supplies a clean base env; layering NO_COLOR on top exercises the
        // env-let path without ambient FORCE_COLOR (e.g. from an IDE) overriding it.
        let proc = spawnCLI('makehtml', ['-c', 'bogus'], {input: 'foo', encoding: 'utf-8', env: {NO_COLOR: '1'}});
        expect(proc.stderr).not.toContain(ESC);
      });

      it('should never colorize the converted output', function () {
        let proc = spawnCLI('makehtml', ['--color', '-m'], {input: '**foo**', encoding: 'utf-8'});
        expect(proc.stdout).not.toContain(ESC);
      });
    });

  });

  describe('makemarkdown command', function () {

    describe('makemarkdown without flags', function () {
      it('should read html from stdin and output markdown to stdout', function () {
        let proc = spawnCLI('makemarkdown', [], {
          input: '<strong>foo</strong>',
          encoding: 'utf-8'
        });
        expect(proc.status).toBe(0);
        expect(proc.stdout.trim()).toBe('**foo**');
        expect(proc.stderr).not.toBe('');
      });
    });

    describe('makemarkdown -m', function () {
      it('should mute information but not the parsed markdown', function () {
        let proc = spawnCLI('makemarkdown', ['-m', '-i'], {
          input: '<em>foo</em>',
          encoding: 'utf-8'
        });
        expect(proc.status).toBe(0);
        expect(proc.stdout.trim()).toBe('*foo*');
        expect(proc.stderr).toBe('');
      });
    });

    describe('makemarkdown -i <file> -o <file>', function () {
      it('should read html from a file and write markdown to a file', function () {
        let out = tmp('md1.md'),
            expectedOtp = fs.readFileSync('test/cli/basic-md.md', 'utf8').toString().trim(),
            proc = spawnCLI('makemarkdown', ['-i', 'test/cli/basic-md.html', '-o', out], {encoding: 'utf-8'});

        expect(proc.status).toBe(0, proc.stderr);
        expect(fs.readFileSync(out, 'utf8').trim()).toBe(expectedOtp);
      });
    });

  });
});
