/**
 * Created by Estevao on 08-06-2015.
 */
var showdown = require('../../dist/showdown.js'),
  converter = new showdown.Converter(),
  bootstrap = require('../bootstrap.js'),
  assertion = bootstrap.assertion,
  testsuite = bootstrap.getTestSuite('test/issues/');

describe('makeHtml() issues testsuite', function () {
  'use strict';
  for (var i = 0; i < testsuite.length; ++i) {
    it(testsuite[i].name, assertion(testsuite[i], converter));
  }
});
