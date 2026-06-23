var fs = require('fs'),
    os = require('os'),
    path = require('path'),
    chai = require('chai'),
    expect = chai.expect,
    chaiMatch = require('chai-match'),
    spawnSync = require('child_process').spawnSync,
    packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

require('sinon');
chai.should();
chai.use(chaiMatch);

/**
 * Spawns a CLI process synchrously
 * @param {string|null} command
 * @param {string[]} args
 * @param {{}} [options]
 * @returns {{output: *, stdout: string, stderr: string, status: number}}
 */
function spawnCLI (command, args, options) {
  'use strict';
  var nargs = ['src/cli/cli.js'];
  if (command) { nargs.push(command);}
  args = nargs.concat(args);
  options = options || {};
  // Spawn with a deterministic, color-free base environment. Some runners (notably IDE
  // test runners) export FORCE_COLOR, which the child would otherwise inherit and emit
  // ANSI codes the assertions don't expect. Stripping it here keeps output stable wherever
  // the suite runs. A test that needs a specific value (e.g. NO_COLOR) sets it through
  // options.env, which is layered on top and therefore wins.
  var env = {};
  Object.keys(process.env).forEach(function (key) {
    if (key !== 'FORCE_COLOR' && key !== 'NO_COLOR') {
      env[key] = process.env[key];
    }
  });
  if (options.env) {
    Object.keys(options.env).forEach(function (key) { env[key] = options.env[key]; });
  }
  options.env = env;
  var otp = spawnSync('node', args, options),
      stdout = otp.stdout.toString(),
      stderr = otp.stderr.toString(),
      output = otp.output[0],
      status = otp.status;

  return {stdout: stdout, stderr: stderr, output: output, status: status};
}

describe('showdown cli', function () {
  'use strict';

  // every assertion here spawns a `node` subprocess; under full-suite CPU load
  // a spawn can exceed mocha's 3s default, so give this spawn-based suite more room
  this.timeout(15000);

  // File-output tests get their own throwaway directory rather than sharing the .build/
  // scratch dir, which collides with the build artifact and grunt's clean step. Combined
  // with asserting the spawn succeeded before reading the file back (see each test), this
  // removes the read-before-write races that surfaced as flaky ENOENT failures.
  var tmpDir;
  before(function () {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'showdown-cli-'));
  });
  after(function () {
    if (tmpDir) { fs.rmSync(tmpDir, {recursive: true, force: true}); }
  });
  function tmp (name) {
    return path.join(tmpDir, name);
  }

  describe('without commands', function () {

    it('should display help if no commands are specified', function () {
      var proc = spawnCLI(null, [], {});
      proc.status.should.equal(1);
      proc.stderr.should.contain('CLI to Showdownjs markdown parser');
      proc.stderr.should.contain('Usage:');
      proc.stderr.should.contain('Options:');
      proc.stderr.should.contain('Commands:');
      proc.stdout.should.equal('');
    });

    describe('-h', function () {
      it('should display help', function () {
        var proc = spawnCLI(null, ['-h'], {});
        proc.status.should.equal(0);
        proc.stdout.should.contain('CLI to Showdownjs markdown parser');
        proc.stdout.should.contain('Usage:');
        proc.stdout.should.contain('Options:');
        proc.stdout.should.contain('Commands:');
        proc.stderr.should.equal('');
      });
    });

    describe('-v', function () {
      it('should display version', function () {
        let proc = spawnCLI(null, ['-V'], {}),
            verRegex = /^(\d{1,2}\.\d{1,3}\.\d{1,3}(?:-(alpha\d{0,2})|(beta\d{0,2})|(rc-\d{1,2})))?/;
        proc.status.should.equal(0);
        proc.stdout.should.match(verRegex);
        proc.stdout.should.match(verRegex).and.capture(0).equals(packageJson.version);
        proc.stderr.should.equal('');
      });
    });
  });

  describe('makehtml command', function () {

    describe('makehtml without flags', function () {
      it('should read from stdin and output to stdout', function () {
        var proc = spawnCLI('makehtml', [], {
          input: '**foo**',
          encoding: 'utf-8'
        });
        proc.status.should.equal(0);
        proc.stdout.trim().should.equal('<p><strong>foo</strong></p>');
        proc.stderr.should.not.equal('');
      });
    });

    describe('makehtml -p', function () {

      it('should enable a flavor', function () {
        var proc = spawnCLI('makehtml', ['-p', 'github'], {
          input: 'this is a :smile:', // test the emoji option as a proxy
          encoding: 'utf-8'
        });
        proc.status.should.equal(0);
        proc.stderr.should.contain('Enabling flavor github...');
        proc.stdout.trim().should.equal('<p>this is a 😄</p>');
        //'Here in London'.should.match(/(here|there) in (\w+)/i).and.capture(1).equals('London');
      });

      it('should give an error if a flavor is not recognised', function () {
        var proc = spawnCLI('makehtml', ['-p', 'foobar'], {
          input: '**foo**',
          encoding: 'utf-8'
        });
        proc.status.should.equal(1);
      });

      it('should list the available flavors in the error of an unrecognised flavor', function () {
        var proc = spawnCLI('makehtml', ['-p', 'foobar'], {
          input: '**foo**',
          encoding: 'utf-8'
        });
        proc.status.should.equal(1);
        proc.stderr.should.contain('Available flavors:');
        proc.stderr.should.contain('vanilla');
      });
    });

    describe('makehtml --list-flavors', function () {
      it('should list the available flavors and exit cleanly', function () {
        var proc = spawnCLI('makehtml', ['--list-flavors'], {encoding: 'utf-8'});
        proc.status.should.equal(0);
        proc.stdout.should.contain('Available flavors:');
        proc.stdout.should.contain('github');
        proc.stdout.should.contain('vanilla');
      });
    });

    describe('makehtml -c', function () {
      it('should not parse emoji if config option is not passed', function () {
        var proc = spawnCLI('makehtml', [], {
          input: 'this is a :smile:',
          encoding: 'utf-8'
        });
        proc.status.should.equal(0);
        proc.stderr.should.not.contain('Enabling option emoji');
        proc.stdout.trim().should.equal('<p>this is a :smile:</p>');
      });

      it('should enable a showdown option', function () {
        var proc = spawnCLI('makehtml', ['-c', 'emoji'], {
          input: 'this is a :smile:',
          encoding: 'utf-8'
        });
        proc.status.should.equal(0);
        proc.stderr.should.contain('Enabling option emoji');
        proc.stdout.trim().should.equal('<p>this is a 😄</p>');
      });

      it('should warn and skip unrecognized options', function () {
        var proc = spawnCLI('makehtml', ['-c', 'foobar'], {
          input: 'foo',
          encoding: 'utf-8'
        });
        proc.status.should.equal(0);
        proc.stderr.should.contain('unknown option \'foobar\'');
        proc.stderr.should.not.contain('Enabling option foobar');
        proc.stdout.trim().should.equal('<p>foo</p>');
      });

      it('should coerce a numeric option', function () {
        var proc = spawnCLI('makehtml', ['-c', 'headerLevelStart=3'], {
          input: '# hi',
          encoding: 'utf-8'
        });
        proc.status.should.equal(0);
        proc.stdout.should.match(/^<h3\b/);
      });

      it('should enable a boolean option passed as =true', function () {
        var proc = spawnCLI('makehtml', ['-c', 'emoji=true'], {
          input: 'this is a :smile:',
          encoding: 'utf-8'
        });
        proc.status.should.equal(0);
        proc.stdout.trim().should.equal('<p>this is a 😄</p>');
      });

      it('should disable a boolean option passed as =false', function () {
        var proc = spawnCLI('makehtml', ['-c', 'emoji=false'], {
          input: 'this is a :smile:',
          encoding: 'utf-8'
        });
        proc.status.should.equal(0);
        proc.stdout.trim().should.equal('<p>this is a :smile:</p>');
      });

      it('should let -c disable an option enabled by a flavor', function () {
        var proc = spawnCLI('makehtml', ['-p', 'github', '-c', 'tables=false'], {
          input: 'a | b\n- | -\n1 | 2',
          encoding: 'utf-8'
        });
        proc.status.should.equal(0);
        proc.stdout.should.not.contain('<table');
      });

      it('should warn on an invalid boolean value', function () {
        var proc = spawnCLI('makehtml', ['-c', 'emoji=notabool'], {
          input: 'this is a :smile:',
          encoding: 'utf-8'
        });
        proc.status.should.equal(0);
        proc.stderr.should.contain('invalid boolean value');
        proc.stdout.trim().should.equal('<p>this is a :smile:</p>');
      });

    });

    describe('makehtml -m', function () {

      it('should mute information', function () {
        var proc = spawnCLI('makehtml', ['-m', '-i'], {input: '**foo**'});
        proc.status.should.equal(0);
        expect(proc.output).to.be.null; // jshint ignore:line
        proc.stdout.trim().should.equal('<p><strong>foo</strong></p>');
        proc.stderr.should.equal('');
      });

      it('should mute everything, even errors', function () {
        var proc = spawnCLI('makehtml', ['-m', '-i']);
        //proc.status.should.equal(0);
        expect(proc.output).to.be.null; // jshint ignore:line
        proc.stdout.should.equal('');
        proc.stderr.should.equal('');
      });

      it('should not mute parsed html', function () {
        var proc = spawnCLI('makehtml', ['-m', '-i'], {
          input: '**foo**',
          encoding: 'utf-8'
        });
        proc.status.should.equal(0);
        proc.stdout.trim().should.equal('<p><strong>foo</strong></p>');
        proc.stderr.should.equal('');
      });
    });

    describe('makehtml -q', function () {

      it('should not display information', function () {
        var proc = spawnCLI('makehtml', ['-q', '-i'], {input: '**foo**'});
        proc.status.should.equal(0);
        expect(proc.output).to.be.null; // jshint ignore:line
        proc.stdout.trim().should.equal('<p><strong>foo</strong></p>');
        proc.stderr.should.match(/^\s*DONE!\s*$/);
      });

      it('should display errors', function () {
        var proc = spawnCLI('makehtml', ['-q', '-i', '-e', 'foo'], {input: 'f'});
        proc.status.should.equal(1);
        expect(proc.output).to.be.null; // jshint ignore:line
        proc.stdout.should.equal('');
        proc.stderr.should.match(/^ERROR:/);
      });

      it('should not mute parsed html', function () {
        var proc = spawnCLI('makehtml', ['-q', '-i'], {
          input: '**foo**',
          encoding: 'utf-8'
        });
        proc.status.should.equal(0);
        proc.stdout.trim().should.equal('<p><strong>foo</strong></p>');
        proc.stderr.should.match(/^\s*DONE!\s*$/);
      });
    });

    describe('makehtml -i -o', function () {
      it('should read from stdin and output to stdout', function () {
        var proc = spawnCLI('makehtml', ['-i', '-o'], {
          input: '**foo**',
          encoding: 'utf-8'
        });
        proc.status.should.equal(0);
        proc.stdout.trim().should.equal('<p><strong>foo</strong></p>');
        proc.stderr.should.not.equal('');
      });
    });

    describe('makehtml -i <file> -o', function () {
      it('should read from a file and output to stdout', function () {
        var expectedOtp = fs.readFileSync('test/cli/basic.html', 'utf8').toString().trim(),
            proc = spawnCLI('makehtml', ['-i', 'test/cli/basic.md'], {encoding: 'utf-8'});

        proc.status.should.equal(0);
        proc.stdout.trim().should.equal(expectedOtp);
        proc.stderr.should.not.equal('');
      });
    });

    describe('makehtml -i -o <file>', function () {
      it('should read from stdin and output to a file', function () {
        var out = tmp('io1.html'),
            proc = spawnCLI('makehtml', ['-m', '-i', '-o', out], {
              encoding: 'utf8',
              input: '**foo**'
            });
        proc.status.should.equal(0, proc.stderr);
        fs.readFileSync(out, 'utf8').trim().should.equal('<p><strong>foo</strong></p>');
      });
    });

    describe('makehtml -i <file> -o <file>', function () {
      it('should read from a file and output to a file', function () {
        var out = tmp('io2.html'),
            expectedOtp = fs.readFileSync('test/cli/basic.html', 'utf8').toString().trim(),
            proc = spawnCLI('makehtml', ['-i', 'test/cli/basic.md', '-o', out], {encoding: 'utf-8'});

        proc.status.should.equal(0, proc.stderr);
        proc.stderr.should.equal('');
        fs.readFileSync(out, 'utf8').trim().should.equal(expectedOtp);
        proc.stdout.should.not.equal(expectedOtp);
      });
    });

    describe('makehtml -a', function () {
      it('should read from stdin and append to a file', function () {
        var out = tmp('io3.html');
        fs.writeFileSync(out, '<p>foo</p>');

        var expectedOtp = '<p>foo</p><p><strong>foo</strong></p>',
            proc = spawnCLI('makehtml', ['-i', '-o', out, '-a'], {
              encoding: 'utf8',
              input: '**foo**'
            });

        proc.status.should.equal(0, proc.stderr);
        // stderr should be empty
        proc.stderr.should.equal('');
        fs.readFileSync(out, 'utf8').trim().should.equal(expectedOtp);
        // since the output is to a file, messages are logged to stdout
        proc.stdout.should.not.equal(expectedOtp);
      });

      it('should ignore -a flag if -o <file> is missing', function () {

        var expectedOtp = '<p><strong>foo</strong></p>',
            proc = spawnCLI('makehtml', ['-a'], {encoding: 'utf8', input: '**foo**'});
        proc.status.should.equal(0);
        proc.stderr.should.not.equal('');
        proc.stdout.trim().should.equal(expectedOtp);
      });
    });

    describe('makehtml -e', function () {
      it('should load the extension', function () {
        var expectedOtp = '<p><strong>bar</strong></p>',
            extPath = path.resolve(__dirname + '/../mocks/mock-extension.js'),
            proc = spawnCLI('makehtml', ['-i', '-o', '-e', extPath], {
              encoding: 'utf8',
              input: '**foo**'
            });
        proc.status.should.equal(0, 'Process exited with error state');
        proc.stdout.trim().should.equal(expectedOtp);
      });

      it('should resolve a relative extension path against the cwd', function () {
        var expectedOtp = '<p><strong>bar</strong></p>',
            relPath = './' + path.relative(process.cwd(), path.resolve(__dirname + '/../mocks/mock-extension.js')).replace(/\\/g, '/'),
            proc = spawnCLI('makehtml', ['-i', '-o', '-e', relPath], {
              encoding: 'utf8',
              input: '**foo**'
            });
        proc.status.should.equal(0, 'Process exited with error state');
        proc.stdout.trim().should.equal(expectedOtp);
      });
    });

    describe('makehtml -y', function () {
      it('should write the output using the requested encoding', function () {
        var out = tmp('enc.html'),
            proc = spawnCLI('makehtml', ['-m', '-i', '-o', out, '-y', 'latin1'], {
              encoding: 'utf8',
              input: '# café'
            });
        proc.status.should.equal(0, proc.stderr);
        var buf = fs.readFileSync(out);
        // latin1 encodes é as a single 0xE9 byte; utf8 would be 0xC3 0xA9
        buf.includes(0xe9).should.equal(true);
        buf.includes(0xc3).should.equal(false);
      });
    });

    describe('makehtml newline handling', function () {
      it('should append a trailing newline when writing to stdout', function () {
        var proc = spawnCLI('makehtml', [], {input: '**foo**', encoding: 'utf-8'});
        proc.status.should.equal(0);
        proc.stdout.should.equal('<p><strong>foo</strong></p>\n');
      });

      it('should not append a trailing newline when writing to a file', function () {
        var out = tmp('nl.html'),
            proc = spawnCLI('makehtml', ['-m', '-i', '-o', out], {
              encoding: 'utf8',
              input: '**foo**'
            });
        proc.status.should.equal(0, proc.stderr);
        fs.readFileSync(out, 'utf8').should.equal('<p><strong>foo</strong></p>');
      });
    });

    describe('makehtml batch / glob input', function () {
      var dir = '.build/batch';

      beforeEach(function () {
        fs.rmSync(dir, {recursive: true, force: true});
        fs.mkdirSync(dir + '/out', {recursive: true});
        fs.writeFileSync(dir + '/a.md', '# A');
        fs.writeFileSync(dir + '/b.md', '# B');
      });

      it('should convert multiple inputs into an output directory', function () {
        var proc = spawnCLI('makehtml', ['-m', '-i', dir + '/a.md', dir + '/b.md', '-o', dir + '/out'], {encoding: 'utf8'});
        proc.status.should.equal(0);
        fs.readFileSync(dir + '/out/a.html', 'utf8').should.contain('>A<');
        fs.readFileSync(dir + '/out/b.html', 'utf8').should.contain('>B<');
      });

      it('should write outputs beside each source when no output is given', function () {
        var proc = spawnCLI('makehtml', ['-m', '-i', dir + '/a.md', dir + '/b.md'], {encoding: 'utf8'});
        proc.status.should.equal(0);
        fs.existsSync(dir + '/a.html').should.equal(true);
        fs.existsSync(dir + '/b.html').should.equal(true);
      });

      it('should expand a glob pattern with the built-in matcher', function () {
        // quote-free single arg so the shell does not pre-expand it on POSIX
        var proc = spawnCLI('makehtml', ['-m', '-i', dir + '/*.md', '-o', dir + '/out'], {encoding: 'utf8'});
        proc.status.should.equal(0);
        fs.existsSync(dir + '/out/a.html').should.equal(true);
        fs.existsSync(dir + '/out/b.html').should.equal(true);
      });

      it('should reject a single output file for multiple inputs', function () {
        var proc = spawnCLI('makehtml', ['-i', dir + '/a.md', dir + '/b.md', '-o', dir + '/one.html'], {encoding: 'utf8'});
        proc.status.should.equal(1);
        proc.stderr.should.contain('directory');
      });

      it('should error when a glob matches nothing', function () {
        var proc = spawnCLI('makehtml', ['-i', dir + '/*.nomatch'], {encoding: 'utf8'});
        proc.status.should.equal(1);
        proc.stderr.should.contain('no files matched');
      });

      it('should create the output directory when it does not exist', function () {
        var proc = spawnCLI('makehtml', ['-m', '-i', dir + '/a.md', dir + '/b.md', '-o', dir + '/new/'], {encoding: 'utf8'});
        proc.status.should.equal(0);
        fs.existsSync(dir + '/new/a.html').should.equal(true);
        fs.existsSync(dir + '/new/b.html').should.equal(true);
      });

      it('should treat a single -o with a trailing slash as a directory', function () {
        var proc = spawnCLI('makehtml', ['-m', '-i', dir + '/a.md', '-o', dir + '/single/'], {encoding: 'utf8'});
        proc.status.should.equal(0);
        fs.existsSync(dir + '/single/a.html').should.equal(true);
      });

      it('should explain that recursive globs are unsupported', function () {
        var proc = spawnCLI('makehtml', ['-i', dir + '/**/*.md'], {encoding: 'utf8'});
        proc.status.should.equal(1);
        proc.stderr.should.contain('recursive');
      });

      it('should give a clear error when the input is a directory', function () {
        var proc = spawnCLI('makehtml', ['-i', dir], {encoding: 'utf8'});
        proc.status.should.equal(1);
        proc.stderr.should.contain('is a directory');
      });
    });

    describe('makehtml -v', function () {
      it('should print extra information in verbose mode', function () {
        var proc = spawnCLI('makehtml', ['-v', '-i'], {input: '**foo**', encoding: 'utf-8'});
        proc.status.should.equal(0);
        proc.stderr.should.contain('bytes from stdin');
        proc.stdout.trim().should.equal('<p><strong>foo</strong></p>');
      });

      it('should not print the extra information without -v', function () {
        var proc = spawnCLI('makehtml', ['-i'], {input: '**foo**', encoding: 'utf-8'});
        proc.status.should.equal(0);
        proc.stderr.should.not.contain('bytes from stdin');
      });
    });

    describe('makehtml color', function () {
      var ESC = String.fromCharCode(27) + '[';

      it('should not emit ANSI codes by default when piped', function () {
        var proc = spawnCLI('makehtml', ['-c', 'bogus'], {input: 'foo', encoding: 'utf-8'});
        proc.stderr.should.not.contain(ESC);
      });

      it('should emit ANSI codes with --color', function () {
        var proc = spawnCLI('makehtml', ['--color', '-c', 'bogus'], {input: 'foo', encoding: 'utf-8'});
        proc.stderr.should.contain(ESC);
      });

      it('should not emit ANSI codes with --no-color', function () {
        var proc = spawnCLI('makehtml', ['--no-color', '-c', 'bogus'], {input: 'foo', encoding: 'utf-8'});
        proc.stderr.should.not.contain(ESC);
      });

      it('should honor the NO_COLOR environment variable', function () {
        // spawnCLI supplies a clean base env; layering NO_COLOR on top exercises the
        // env-var path without ambient FORCE_COLOR (e.g. from an IDE) overriding it.
        var proc = spawnCLI('makehtml', ['-c', 'bogus'], {input: 'foo', encoding: 'utf-8', env: {NO_COLOR: '1'}});
        proc.stderr.should.not.contain(ESC);
      });

      it('should never colorize the converted output', function () {
        var proc = spawnCLI('makehtml', ['--color', '-m'], {input: '**foo**', encoding: 'utf-8'});
        proc.stdout.should.not.contain(ESC);
      });
    });

  });

  describe('makemarkdown command', function () {

    describe('makemarkdown without flags', function () {
      it('should read html from stdin and output markdown to stdout', function () {
        var proc = spawnCLI('makemarkdown', [], {
          input: '<strong>foo</strong>',
          encoding: 'utf-8'
        });
        proc.status.should.equal(0);
        proc.stdout.trim().should.equal('**foo**');
        proc.stderr.should.not.equal('');
      });
    });

    describe('makemarkdown -m', function () {
      it('should mute information but not the parsed markdown', function () {
        var proc = spawnCLI('makemarkdown', ['-m', '-i'], {
          input: '<em>foo</em>',
          encoding: 'utf-8'
        });
        proc.status.should.equal(0);
        proc.stdout.trim().should.equal('*foo*');
        proc.stderr.should.equal('');
      });
    });

    describe('makemarkdown -i <file> -o <file>', function () {
      it('should read html from a file and write markdown to a file', function () {
        var out = tmp('md1.md'),
            expectedOtp = fs.readFileSync('test/cli/basic-md.md', 'utf8').toString().trim(),
            proc = spawnCLI('makemarkdown', ['-i', 'test/cli/basic-md.html', '-o', out], {encoding: 'utf-8'});

        proc.status.should.equal(0, proc.stderr);
        fs.readFileSync(out, 'utf8').trim().should.equal(expectedOtp);
      });
    });

  });
});
