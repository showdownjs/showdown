/**
 * Created by Estevao on 27/01/2017.
 */
var bootstrap = require('../bootstrap.js'),
  showdown = bootstrap.showdown;

describe('encodeEmailAddress()', function () {
  'use strict';
  var encoder = showdown.helper.encodeEmailAddress,
      email = 'foobar@example.com',
      encodedEmail = encoder(email);

  it('should encode email', function () {
    encodedEmail.should.not.equal(email);
  });

  it('should decode to original email', function () {
    var decodedEmail = encodedEmail.replace(/&#(.+?);/g, function (wm, cc) {
      if (cc.charAt(0) === 'x') {
        //hex
        return String.fromCharCode('0' + cc);
      } else {
        //dec
        return String.fromCharCode(cc);
      }
    });
    decodedEmail.should.equal(email);
  });
});
