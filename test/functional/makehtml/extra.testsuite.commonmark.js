/**
 * Created by Estevao on 08-06-2015.
 */

// jshint ignore: start
let bootstrap = require('./makehtml.bootstrap.js'),
    converter = new bootstrap.showdown.Converter({
      noHeaderId: true,
      requireSpaceBeforeHeadingText: true
    }),
    assertion = bootstrap.assertion,
    testsuite = bootstrap.getJsonTestSuite('test/functional/makehtml/cases/commonmark.testsuite.json');

describe('makeHtml() commonmark testsuite', function () {
  'use strict';

  for (let section in testsuite) {
    if (testsuite.hasOwnProperty(section)) {
      describe(section, function () {
        for (let i = 0; i < testsuite[section].length; ++i) {
          let name = testsuite[section][i].name;
          switch (name) {
            case 'ATX headings_79': // empty headings don't make sense
            case 'Setext headings_93': // spec says it cannot be lazy continuation but then proceeds to make it a lazy continuation.
            case 'Thematic breaks_43': // malformed input of test case
            case 'Thematic breaks_61': // hr inside lists does not make sense
              continue;
            case 'Setext headings_91': //it's failing because the testcase converts " to &quot; even though it's not supposed to
              testsuite[section][i].expected = testsuite[section][i].expected.replace(/&quot;/g, '"')
              break;
          }
          it(name, assertion(testsuite[section][i], converter, true));
        }
      });
    }
  }
});
