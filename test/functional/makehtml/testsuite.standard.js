/**
 * Created by Estevao on 08-06-2015.
 */

// jshint ignore: start
let bootstrap = require('./makehtml.bootstrap.js'),
    showdown = bootstrap.showdown,
    assertion = bootstrap.assertion,
    testsuite = bootstrap.getJsonTestSuite('test/functional/makehtml/cases/standard.testsuite.json');

describe('makeHtml() standard testsuite', function () {
  'use strict';

  for (let section in testsuite) {
    if (testsuite.hasOwnProperty(section)) {
      describe(section, function () {
        for (let i = 0; i < testsuite[section].length; ++i) {
          let testCase = testsuite[section][i];
          let name = testCase.name.replace(/-/g, ' ');
          let number = testCase.number;
          let converter = new showdown.Converter(testCase.options);
          it(number + ': ' + name, assertion(testCase, converter));
        }
      });
    }
  }
});
