/**
 * Created by Estevao on 08-06-2015.
 */

var bootstrap = require('./makemarkdown.bootstrap.js'),
    converter = new bootstrap.showdown.Converter(),
    assertion = bootstrap.assertion,
    testsuite = bootstrap.getTestSuite('test/functional/makemarkdown/cases/standard/');

describe('makeMarkdown() standard testsuite', function () {
  'use strict';
  for (var i = 0; i < testsuite.length; ++i) {
    it(testsuite[i].name.replace(/-/g, ' '), assertion(testsuite[i], converter));
  }
});
