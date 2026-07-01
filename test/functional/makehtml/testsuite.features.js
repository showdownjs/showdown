/**
 * Created by Estevao on 23-06-2026.
 */

// jshint ignore: start
let bootstrap = require('./makehtml.bootstrap.js'),
    showdown = bootstrap.showdown,
    assertion = bootstrap.assertion,
    testsuite = bootstrap.getJsonTestSuite('test/functional/makehtml/cases/features.testsuite.json');

describe('makeHtml() features testsuite', function () {
  'use strict';

  for (let section in testsuite) {
    if (Object.prototype.hasOwnProperty.call(testsuite, section)) {
      describe(section, function () {
        for (let i = 0; i < testsuite[section].length; ++i) {
          let testCase = testsuite[section][i];
          let name = testCase.name.replace(/-/g, ' ');
          let number = testCase.number;
          // each case carries the converter options it needs in the fixture
          let converter = new showdown.Converter(testCase.options);
          it(number + ': ' + name, assertion(testCase, converter, true));
        }
      });
    }
  }
});
