/**
 * Created by Estevao on 14-07-2015.
 */
var bootstrap = require('../bootstrap.js'),
  converter = new bootstrap.showdown.Converter({
    strikethrough:             true,
    literalMidWordUnderscores: true,
    simplifiedAutoLink:        true,
    tables:                    true,
    parseImgDimensions:        true, //extra
    tasklists:                 true  //extra
  }),
  assertion = bootstrap.assertion,
  testsuite = bootstrap.getTestSuite('test/ghost/');

//MD-Testsuite (borrowed from karlcow/markdown-testsuite)
describe('makeHtml() ghost testsuite', function () {
  'use strict';
  for (var i = 0; i < testsuite.length; ++i) {
    it(testsuite[i].name.replace(/-/g, ' '), assertion(testsuite[i], converter));
  }
});
