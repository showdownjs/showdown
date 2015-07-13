var execSync = require('child_process').execSync,
    cmd = 'node bin/showdown.js';

describe('showdown cli', function () {
  'use strict';

  it('basic stdin stdout', function () {
    var otp = execSync(cmd + ' makehtml', {
      encoding: 'utf8',
      input: '**foo**'
    });
    otp.trim().should.equal('<p><strong>foo</strong></p>');
  });
});
