/*
var semver = require('semver'),
  cmd = 'node bin/showdown.js';

describe('showdown cli', function () {
  'use strict';
  if (semver.gt(process.versions.node, '0.12.0')) {
    var execSync = require('child_process').execSync;
    it('basic stdin stdout', function () {
      var otp = execSync(cmd + ' makehtml -q', {
        encoding: 'utf8',
        input: '**foo**'
      });
      otp.trim().should.equal('<p><strong>foo</strong></p>');
    });
  }
});
*/
