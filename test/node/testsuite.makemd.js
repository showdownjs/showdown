var bootstrap = require('../bootstrap.js'),
    converter = new bootstrap.showdown.Converter(),
    testsuite = bootstrap.getHtmlToMdTestSuite('test/makeMd/'),
    assertion = bootstrap.assertion;

describe('makeMd() standard testsuite', function () {
  'use strict';
  for (var i = 0; i < testsuite.length; ++i) {
    it(testsuite[i].name.replace(/-/g, ' '), assertion(testsuite[i], converter, 'makeMd'));
  }
});

