/**
 * Created by Estevao on 08-06-2015.
 */
var showdown = require('../../dist/showdown.js'),
    bootstrap = require('../bootstrap.js'),
    assertion = bootstrap.assertion,
    testsuite = bootstrap.getTestSuite('test/features/');

describe('makeHtml() features testsuite', function () {
  'use strict';
  for (var i = 0; i < testsuite.length; ++i) {
    var converter;
    if (testsuite[i].name === '#143.support_image_dimensions') {
      converter = new showdown.Converter({parseImgDimensions: true});
    } else {
      converter = new showdown.Converter();
    }
    it(testsuite[i].name, assertion(testsuite[i], converter));
  }
});
