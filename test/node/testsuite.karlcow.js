var bootstrap = require('../bootstrap.js'),
    converter = new bootstrap.showdown.Converter({noHeaderId: true}),
    assertion = bootstrap.assertion,
    testsuite = bootstrap.getTestSuite('test/karlcow/');

//MD-Testsuite (borrowed from karlcow/markdown-testsuite)
describe('makeHtml() karlcow testsuite', function () {
  'use strict';
  for (var i = 0; i < testsuite.length; ++i) {
    it(testsuite[i].name.replace(/-/g, ' '), assertion(testsuite[i], converter));
  }
});
