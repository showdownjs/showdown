/**
 * Created by Estevao on 08-06-2015.
 */

// jshint ignore: start
let bootstrap = require('./makehtml.bootstrap.js'),
    showdown = bootstrap.showdown,
    assertion = bootstrap.assertion,
    testsuite = bootstrap.getJsonTestSuite('test/functional/makehtml/cases/karlcow.testsuite.json');

//MD-Testsuite (borrowed from karlcow/markdown-testsuite)
describe('makeHtml() karlcow testsuite', function () {
  'use strict';

  for (let section in testsuite) {
    if (Object.prototype.hasOwnProperty.call(testsuite, section)) {
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
