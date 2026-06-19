/**
 * Created by Estevao on 08-06-2015.
 */

var bootstrap = require('./makemarkdown.bootstrap.js'),
    // the standard suite exercises full markdown emission, so it runs with every reverse
    // feature enabled; the raw-HTML fallback (when a feature is disabled) is covered separately
    converter = new bootstrap.showdown.Converter({
      strikethrough: true, tables: true, tasklists: true, underline: true, parseImgDimensions: true
    }),
    assertion = bootstrap.assertion,
    testsuite = bootstrap.getTestSuite('test/functional/makemarkdown/cases/standard/');

describe('makeMarkdown() standard testsuite', function () {
  'use strict';
  for (var i = 0; i < testsuite.length; ++i) {
    it(testsuite[i].name.replace(/-/g, ' '), assertion(testsuite[i], converter));
  }
});
