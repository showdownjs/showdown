var execSync = require('child_process').execSync;

describe('showdown cli', function () {
  'use strict';
  it('basic stdin stdout', function () {
    var otp = execSync('showdown makehtml', {
      encoding: 'utf8',
      input: '**foo**'
    });
    otp.trim().should.equal('<p><strong>foo</strong></p>');
  });
});

