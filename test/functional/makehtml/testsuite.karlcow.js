/**
 * Created by Estevao on 08-06-2015.
 */

var bootstrap = require('./makehtml.bootstrap.js'),
    converter = new bootstrap.showdown.Converter({noHeaderId: true}),
    assertion = bootstrap.assertion,
    testsuite = bootstrap.getTestSuite('test/functional/makehtml/cases/karlcow/');

//MD-Testsuite (borrowed from karlcow/markdown-testsuite)
describe('makeHtml() karlcow testsuite', function () {
  'use strict';
  for (var i = 0; i < testsuite.length; ++i) {
    it(testsuite[i].name.replace(/-/g, ' '), assertion(testsuite[i], converter));
  }
});
