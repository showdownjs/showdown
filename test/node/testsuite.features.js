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
    } else if (testsuite[i].name === '#69.header_level_start') {
      converter = new showdown.Converter({headerLevelStart: 3});
    } else if (testsuite[i].name === '#164.1.simple_autolink') {
      converter = new showdown.Converter({simplifiedAutoLink: true});
    } else if (testsuite[i].name === '#164.2.disallow_underscore_emphasis_mid_word') {
      converter = new showdown.Converter({literalMidWordUnderscores: true});
    } else if (testsuite[i].name === '#164.3.strikethrough') {
      converter = new showdown.Converter({strikethrough: true});
    } else {
      converter = new showdown.Converter();
    }
    it(testsuite[i].name, assertion(testsuite[i], converter));
  }
});
