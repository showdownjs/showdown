/**
 * Created by Estevao on 08-06-2015.
 */

var bootstrap = require('./makehtml.bootstrap.js'),
    converter = new bootstrap.showdown.Converter(),
    assertion = bootstrap.assertion,
    testsuite = bootstrap.getTestSuite('test/functional/makehtml/cases/standard/');

describe('makeHtml() standard testsuite', function () {
  'use strict';
  for (var i = 0; i < testsuite.length; ++i) {
    it(testsuite[i].name.replace(/-/g, ' '), assertion(testsuite[i], converter));
  }
});
