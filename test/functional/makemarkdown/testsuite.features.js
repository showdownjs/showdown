/**
 * Created by Estevao on 08-06-2015.
 */
var bootstrap = require('./makemarkdown.bootstrap.js'),
    showdown = bootstrap.showdown,
    assertion = bootstrap.assertion,
    testsuite = bootstrap.getTestSuite('test/functional/makemarkdown/cases/features/');

describe('makeMarkdown() features testsuite', function () {
  'use strict';

  describe('issues', function () {
    for (var i = 0; i < testsuite.length; ++i) {
      var converter;
      if (testsuite[i].name === '#164.4.tasklists') {
        converter = new showdown.Converter({tasklists: true});
      } else {
        converter = new showdown.Converter();
      }
      it(testsuite[i].name.replace(/-/g, ' '), assertion(testsuite[i], converter));
    }
  });
});
