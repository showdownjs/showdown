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
            case 'Setext headings_92': // lazy continuation is needed for compatibility
            case 'Setext headings_93': // lazy continuation is needed for compatibility
            case 'Setext headings_94': // lazy continuation is needed for compatibility
              continue;
          }


          if (testsuite[section][i].name === 'ATX headings_79') {
            continue;
          }
          it(name, assertion(testsuite[section][i], converter, true));
        }
      });
    }
  }
});
