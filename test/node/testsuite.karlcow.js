var showdown = require('../../dist/showdown.js'),
    converter = new showdown.Converter({noHeaderId: true}),
    bootstrap = require('../bootstrap.js'),
    assertion = bootstrap.assertion,
    testsuite = bootstrap.getTestSuite('test/karlcow/');

//MD-Testsuite (borrowed from karlcow/markdown-testsuite)
describe('makeHtml() karlcow testsuite', function () {
  for (var i = 0; i < testsuite.length; ++i) {
    it(testsuite[i].name, assertion(testsuite[i], converter));
  }
});
