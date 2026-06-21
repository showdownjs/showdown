var fs = require('fs'),
    path = require('path'),
    chai = require('chai'),
    expect = chai.expect,
    chaiMatch = require('chai-match'),
    execSync = require('child_process').execSync,
    spawnSync = require('child_process').spawnSync,
    cmd = 'node src/cli/cli.js',
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
  var otp = spawnSync('node', args, options),
      stdout = otp.stdout.toString(),
      stderr = otp.stderr.toString(),
      output = otp.output[0],
      status = otp.status;

  return {stdout: stdout, stderr: stderr, output: output, status: status};
}

describe('showdown cli', function () {
  'use strict';

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
        execSync(cmd + ' makehtml -m -i -o .build/io1.html', {
          encoding: 'utf8',
          input: '**foo**'
        });
        var otp = fs.readFileSync('.build/io1.html', 'utf8').toString().trim(),
            expectedOtp = '<p><strong>foo</strong></p>';

        otp.trim().should.equal(expectedOtp);
      });
    });

    describe('makehtml -i <file> -o <file>', function () {
      it('should read from a file and output to a file', function () {
        var expectedOtp = fs.readFileSync('test/cli/basic.html', 'utf8').toString().trim(),
            proc = spawnCLI('makehtml', ['-i', 'test/cli/basic.md', '-o', '.build/io2.html'], {encoding: 'utf-8'}),
            otp = fs.readFileSync('.build/io2.html', 'utf8').toString().trim();

        otp.trim().should.equal(expectedOtp);
        proc.stdout.should.not.equal(expectedOtp);
        proc.stderr.should.equal('');
        proc.status.should.equal(0);
      });
    });

    describe('makehtml -a', function () {
      it('should read from stdin and append to a file', function () {
        fs.writeFileSync('.build/io3.html', '<p>foo</p>');

        var expectedOtp = '<p>foo</p><p><strong>foo</strong></p>',
            proc = spawnCLI('makehtml', ['-i', '-o', '.build/io3.html', '-a'], {
              encoding: 'utf8',
              input: '**foo**'
            }),
            otp = fs.readFileSync('.build/io3.html', 'utf8').toString().trim();

        proc.status.should.equal(0);
        otp.trim().should.equal(expectedOtp);
        // since the output is to a file, messages are logged to stdout
        proc.stdout.should.not.equal(expectedOtp);
        // stderr should be empty
        proc.stderr.should.equal('');
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
        spawnCLI('makehtml', ['-m', '-i', '-o', '.build/enc.html', '-y', 'latin1'], {
          encoding: 'utf8',
          input: '# café'
        });
        var buf = fs.readFileSync('.build/enc.html');
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
        spawnCLI('makehtml', ['-m', '-i', '-o', '.build/nl.html'], {
          encoding: 'utf8',
          input: '**foo**'
        });
        var otp = fs.readFileSync('.build/nl.html', 'utf8');
        otp.should.equal('<p><strong>foo</strong></p>');
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
        var expectedOtp = fs.readFileSync('test/cli/basic-md.md', 'utf8').toString().trim(),
            proc = spawnCLI('makemarkdown', ['-i', 'test/cli/basic-md.html', '-o', '.build/md1.md'], {encoding: 'utf-8'}),
            otp = fs.readFileSync('.build/md1.md', 'utf8').toString().trim();

        proc.status.should.equal(0);
        otp.should.equal(expectedOtp);
      });
    });

  });
});
